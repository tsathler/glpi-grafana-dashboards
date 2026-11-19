import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dashboard = JSON.parse(await readFile(path.join(root, 'grafana/dashboards/glpi-projects.json'), 'utf8'));
const sqlDirectory = path.join(root, 'sql/projects/queries');
const { spec } = dashboard;

function normalizeLineEndings(text) {
  return text.replace(/\r\n?/g, '\n');
}

function panelById(id) {
  const element = spec.elements[`panel-${id}`];
  assert.ok(element, `missing panel ${id}`);
  return element.spec;
}

function rawSql(panel) {
  return panel.data.spec.queries.map((query) => query.spec.query.spec.rawSql);
}

const rows = spec.layout.spec.rows.map((row) => row.spec.layout);
const rowPanelIds = rows.map((layout) =>
  layout.spec.items.map((item) => Number(item.spec.element.name.replace('panel-', ''))),
);

test('project dashboard is a V2 resource with a stable identity', () => {
  assert.equal(dashboard.apiVersion, 'dashboard.grafana.app/v2');
  assert.equal(dashboard.kind, 'Dashboard');
  assert.equal(dashboard.metadata.name, 'glpi-projects');
  assert.equal(spec.editable, false);
  assert.equal(spec.layout.kind, 'RowsLayout');
});

test('rows follow the documented heading, KPI and gauge layout', () => {
  assert.deepEqual(rowPanelIds, [[17], [21], [11, 1, 2, 3, 18], [22], [12, 13, 14, 19, 20], [4, 15]]);
  assert.deepEqual(rows.map(({ kind }) => kind), [
    'GridLayout', 'GridLayout', 'AutoGridLayout', 'GridLayout', 'AutoGridLayout', 'AutoGridLayout',
  ]);
  assert.equal(rows[2].spec.maxColumnCount, 5);
  assert.equal(rows[4].spec.maxColumnCount, 5);
  assert.equal(rows[5].spec.maxColumnCount, 2);
  for (const index of [0, 1, 3]) {
    assert.equal(rows[index].spec.items[0].spec.width, 24);
  }
});

test('every element is referenced by the layout exactly once', () => {
  const referenced = rowPanelIds.flat().map((id) => `panel-${id}`).sort();
  assert.deepEqual(referenced, Object.keys(spec.elements).sort());
});

test('panel types match their role', () => {
  assert.match(panelById(17).vizConfig.spec.options.content, /DESENVOLVIMENTO/);
  for (const id of [17, 21, 22]) assert.equal(panelById(id).vizConfig.group, 'text');
  for (const id of [11, 1, 2, 3, 18, 12, 13, 14, 19, 20]) assert.equal(panelById(id).vizConfig.group, 'stat');
  for (const id of [4, 15]) {
    const panel = panelById(id);
    assert.equal(panel.vizConfig.group, 'gauge');
    assert.equal(panel.vizConfig.spec.fieldConfig.defaults.unit, 'percent');
    assert.equal(panel.vizConfig.spec.fieldConfig.defaults.min, 0);
    assert.equal(panel.vizConfig.spec.fieldConfig.defaults.max, 100);
  }
});

test('query panels embed exactly the versioned SQL mapped by panel ID', async () => {
  const entries = (await readdir(sqlDirectory)).filter((name) => name.endsWith('.sql'));
  const queryPanels = Object.values(spec.elements)
    .map(({ spec: panel }) => panel)
    .filter((panel) => panel.data.spec.queries.length > 0);
  for (const panel of queryPanels) {
    const queries = rawSql(panel);
    assert.equal(queries.length, 1, `panel ${panel.id} must have one query`);
    const matches = entries.filter((name) => name.startsWith(`${String(panel.id).padStart(2, '0')}-`));
    assert.equal(matches.length, 1, `expected one SQL file for panel ${panel.id}`);
    const versionedSql = normalizeLineEndings(await readFile(path.join(sqlDirectory, matches[0]), 'utf8')).trim();
    assert.strictEqual(normalizeLineEndings(queries[0]).trim(), versionedSql, `SQL mismatch for panel ${panel.id}`);
  }
  assert.equal(queryPanels.length, entries.length, 'every project SQL file must back one panel');
});

test('project metrics respect entity scope and valid records', () => {
  for (const panel of Object.values(spec.elements).map(({ spec: p }) => p)) {
    for (const query of rawSql(panel)) {
      assert.match(query, /p\.entities_id\s+IN\s*\(\$entity\)/, `panel ${panel.id} must filter by entity`);
      assert.match(query, /p\.is_deleted\s*=\s*0/, `panel ${panel.id} must exclude deleted projects`);
      assert.match(query, /p\.is_template\s*=\s*0/, `panel ${panel.id} must exclude project templates`);
      if (/glpi_projecttasks/.test(query)) {
        assert.match(query, /pt\.is_deleted\s*=\s*0/, `panel ${panel.id} must exclude deleted tasks`);
        assert.match(query, /pt\.is_template\s*=\s*0/, `panel ${panel.id} must exclude task templates`);
      }
    }
  }
});

test('SQL matching normalizes line endings without ignoring query changes', () => {
  const unixSql = 'SELECT value\nFROM source;';
  const windowsSql = 'SELECT value\r\nFROM source;';
  const oldMacSql = 'SELECT value\rFROM source;';
  const changedSql = 'SELECT other_value\r\nFROM source;';

  assert.strictEqual(normalizeLineEndings(unixSql), normalizeLineEndings(windowsSql));
  assert.strictEqual(normalizeLineEndings(unixSql), normalizeLineEndings(oldMacSql));
  assert.notStrictEqual(normalizeLineEndings(unixSql), normalizeLineEndings(changedSql));
});

test('removed panels stay absent', () => {
  const panels = Object.values(spec.elements).map(({ spec: panel }) => panel);
  assert.ok(panels.every((panel) => !['table', 'barchart', 'piechart'].includes(panel.vizConfig.group)));
  assert.ok(panels.every(({ title }) => !/prioridade|por estado|membro/i.test(title)));
});
