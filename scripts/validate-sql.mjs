import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function sqlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sqlFiles(path);
    return entry.isFile() && entry.name.endsWith('.sql') ? [path] : [];
  });
}

function maskCommentsAndQuotes(source, path) {
  let masked = '';
  let mode = 'code';
  let quote = '';

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (mode === 'code') {
      if (char === '-' && next === '-' && /\s/.test(source[i + 2] ?? ' ')) {
        mode = 'line-comment';
        masked += '  ';
        i += 1;
      } else if (char === '#') {
        mode = 'line-comment';
        masked += ' ';
      } else if (char === '/' && next === '*') {
        mode = 'block-comment';
        masked += '  ';
        i += 1;
      } else if (char === "'" || char === '"' || char === '`') {
        mode = 'quote';
        quote = char;
        masked += ' ';
      } else {
        masked += char;
      }
    } else if (mode === 'line-comment') {
      if (char === '\n') mode = 'code';
      masked += char === '\n' ? '\n' : ' ';
    } else if (mode === 'block-comment') {
      if (char === '*' && next === '/') {
        mode = 'code';
        masked += '  ';
        i += 1;
      } else {
        masked += char === '\n' ? '\n' : ' ';
      }
    } else if (char === '\\' && next !== undefined) {
      masked += '  ';
      i += 1;
    } else if (char === quote && next === quote) {
      masked += '  ';
      i += 1;
    } else if (char === quote) {
      mode = 'code';
      masked += ' ';
    } else {
      masked += char === '\n' ? '\n' : ' ';
    }
  }

  if (mode === 'quote' || mode === 'block-comment') {
    throw new Error(`${path}: unterminated SQL quote or comment`);
  }
  return masked;
}

function validateSql(path) {
  const source = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  if (!source.trim()) throw new Error(`${path}: empty SQL file`);
  const executable = maskCommentsAndQuotes(source, path);
  const statements = executable.split(';').map((part) => part.trim()).filter(Boolean);
  if (statements.length === 0) throw new Error(`${path}: no SQL statement`);

  for (const statement of statements) {
    if (!/^(SELECT|SHOW|DESCRIBE|EXPLAIN)\b/i.test(statement)) {
      throw new Error(`${path}: statement must start with SELECT, SHOW, DESCRIBE, or EXPLAIN`);
    }
    if (/\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|REPLACE|CALL|EXECUTE|PREPARE|SET|LOAD|INTO|LOCK)\b/i.test(statement)) {
      throw new Error(`${path}: write-capable SQL keyword found`);
    }
    if (/\bSELECT\s+\*/i.test(statement)) {
      throw new Error(`${path}: SELECT * is not allowed`);
    }
  }
}

const sqlRoot = join(root, 'sql');
const discoveryRoot = join(sqlRoot, 'discovery');
const allSql = sqlFiles(sqlRoot);
const discovery = sqlFiles(discoveryRoot);
if (discovery.length === 0) {
  throw new Error('Expected versioned SQL in sql/discovery/');
}
allSql.forEach(validateSql);

const dashboardRoot = join(root, 'grafana', 'dashboards');
const dashboards = readdirSync(dashboardRoot).filter((name) => name.endsWith('.json'));
if (dashboards.length === 0) throw new Error('No dashboard JSON files found');
const dashboardQuerySets = [
  { dashboard: 'glpi-service-desk.json', queryDirectory: join(sqlRoot, 'queries') },
  { dashboard: 'glpi-projects.json', queryDirectory: join(sqlRoot, 'projects', 'queries') },
];
const expectedDashboards = new Set([...dashboardQuerySets.map(({ dashboard }) => dashboard), 'glpi-projects-detail.json']);
for (const name of expectedDashboards) {
  if (!dashboards.includes(name)) throw new Error(`Expected dashboard ${name}`);
}
for (const name of dashboards) {
  if (!expectedDashboards.has(name)) throw new Error(`No query directory mapping configured for ${name}`);
}

let matchedQueryCount = 0;
for (const { dashboard: name, queryDirectory, panelIds } of dashboardQuerySets) {
  const allQueries = sqlFiles(queryDirectory);
  const queries = panelIds
    ? allQueries.filter((path) => panelIds.includes(Number(path.match(/(?:^|[\\/])(\d+)-/)?.[1])))
    : allQueries;
  if (queries.length === 0) throw new Error(`${relative(root, queryDirectory)}: no SQL queries found`);
  const dashboard = JSON.parse(readFileSync(join(dashboardRoot, name), 'utf8'));
  if (name === 'glpi-projects.json') {
    const detailDashboard = JSON.parse(readFileSync(join(dashboardRoot, 'glpi-projects-detail.json'), 'utf8'));
    dashboard.panels = [...(dashboard.panels ?? []), ...(detailDashboard.panels ?? [])];
  }
  if (name === 'glpi-projects.json') {
    const kanban = dashboard.panels?.find((panel) => panel.id === 9);
    const options = kanban?.options ?? {};
    if (kanban?.type !== 'marcusolsson-dynamictext-panel') {
      throw new Error(`${name}: panel 9 must use the Business Text visualization`);
    }
    if (options.renderMode !== 'allRows' || typeof options.helpers !== 'string' ||
        !options.helpers.includes("registerHelper('renderKanban'")) {
      throw new Error(`${name}: Business Text must register renderKanban in helpers and render all rows`);
    }
    if (options.editor?.format !== 'html' || typeof options.afterRender !== 'string') {
      throw new Error(`${name}: invalid Business Text editor/afterRender options`);
    }
    if (typeof options.content !== 'string' || !options.content.includes('{{{renderKanban data}}}') ||
        typeof options.styles !== 'string' || options.styles.trim() === '') {
      throw new Error(`${name}: Kanban HTML content and CSS styles must be provisioned`);
    }
    for (const obsolete of ['mode', 'renderTemplate', 'javascript']) {
      if (Object.hasOwn(options, obsolete)) {
        throw new Error(`${name}: obsolete Business Text option ${obsolete}`);
      }
    }
    if (options.disableSanitizeHtml === true) {
      throw new Error(`${name}: Business Text HTML sanitization must remain enabled`);
    }
  }
  const matchedQueries = new Set();
  for (const panel of dashboard.panels ?? []) {
    for (const target of panel.targets ?? []) {
      if (typeof target.rawSql !== 'string') continue;
      const prefix = `${String(panel.id).padStart(2, '0')}-`;
      const matches = queries.filter((path) => path.startsWith(join(queryDirectory, prefix)));
      if (matches.length !== 1) {
        throw new Error(`${name}: panel ${panel.id} must map to exactly one ${prefix}*.sql file`);
      }
      const expected = readFileSync(matches[0], 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim();
      const embedded = target.rawSql.replace(/\r\n/g, '\n').trim();
      if (embedded !== expected) {
        throw new Error(`${name}: panel ${panel.id} SQL differs from ${relative(root, matches[0])}`);
      }
      if (matchedQueries.has(matches[0])) {
        throw new Error(`${relative(root, matches[0])}: mapped to more than one dashboard panel`);
      }
      matchedQueries.add(matches[0]);
    }
  }
  for (const path of queries) {
    if (!matchedQueries.has(path)) throw new Error(`${relative(root, path)}: no matching dashboard panel`);
  }
  matchedQueryCount += matchedQueries.size;
}

console.log(`OK: ${allSql.length} read-only SQL files; ${matchedQueryCount} query/dashboard matches`);
