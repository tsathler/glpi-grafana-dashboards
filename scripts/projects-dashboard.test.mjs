import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dashboard = JSON.parse(await readFile(path.join(root, 'grafana/dashboards/glpi-projects.json'), 'utf8'));
const sqlDirectory = path.join(root, 'sql/projects/queries');

function normalizeLineEndings(text) {
  return text.replace(/\r\n?/g, '\n');
}

test('project dashboard has the development heading, six KPI columns, and team chart', async () => {
  assert.equal(dashboard.uid, 'glpi-projects');
  assert.deepEqual(dashboard.panels.map(({ id }) => id), [17, 11, 1, 2, 3, 18, 4, 12, 13, 14, 19, 20, 15, 16]);
  assert.equal(dashboard.panels[0].type, 'text');
  assert.match(dashboard.panels[0].options.content, /DESENVOLVIMENTO/);
  assert.deepEqual(dashboard.panels[0].gridPos, { x: 0, y: 0, w: 24, h: 4 });
  assert.ok(dashboard.panels.slice(1, 7).every(({ type }) => type === 'stat'));
  assert.ok(dashboard.panels.slice(7, 13).every(({ type }) => type === 'stat'));
  assert.deepEqual(dashboard.panels.slice(1, 7).map(({ gridPos }) => [gridPos.x, gridPos.y, gridPos.w, gridPos.h]), [
    [0, 5, 4, 4], [4, 5, 4, 4], [8, 5, 4, 4], [12, 5, 4, 4], [16, 5, 4, 4], [20, 5, 4, 4],
  ]);
  assert.deepEqual(dashboard.panels.slice(7, 13).map(({ gridPos }) => [gridPos.x, gridPos.y, gridPos.w, gridPos.h]), [
    [0, 9, 4, 4], [4, 9, 4, 4], [8, 9, 4, 4], [12, 9, 4, 4], [16, 9, 4, 4], [20, 9, 4, 4],
  ]);
  assert.deepEqual(dashboard.panels[13].gridPos, { x: 0, y: 14, w: 24, h: 14 });
  assert.equal(dashboard.panels[13].title, 'Tarefas por membro da equipe');
  assert.equal(dashboard.panels.filter(({ type }) => type === 'barchart').length, 1);
  assert.equal(dashboard.panels[13].options.orientation, 'horizontal');
  assert.ok(dashboard.panels.slice(1).every(({ targets }) => targets.length === 1));
});

test('project dashboard query text matches the versioned SQL mapped by panel ID', async () => {
  const entries = await import('node:fs/promises').then(({ readdir }) => readdir(sqlDirectory));
  for (const panel of dashboard.panels) {
    const matches = entries.filter((name) => name.startsWith(`${String(panel.id).padStart(2, '0')}-`));
    assert.equal(matches.length, 1, `expected one SQL file for panel ${panel.id}`);
    const embeddedSql = normalizeLineEndings(panel.targets[0].rawSql).trim();
    const versionedSql = normalizeLineEndings(await readFile(path.join(sqlDirectory, matches[0]), 'utf8')).trim();
    assert.strictEqual(embeddedSql, versionedSql, `SQL mismatch for panel ${panel.id}`);
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

test('removed table and priority chart stay absent', () => {
  assert.ok(dashboard.panels.every(({ type }) => type !== 'table'));
  assert.ok(dashboard.panels.every(({ title }) => !/prioridade/i.test(title)));
  assert.ok(dashboard.panels.every(({ title }) => !/por estado/i.test(title)));
});

test('team member query uses only User relations, distinct task counts, entity scope, and an unassigned category', () => {
  const panel = dashboard.panels.find(({ id }) => id === 16);
  const query = panel.targets[0].rawSql;
  assert.match(query, /glpi_projecttaskteams/);
  assert.match(query, /itemtype\s*=\s*'User'/);
  assert.match(query, /COUNT\s*\(\s*DISTINCT\s+pt\.id\s*\)/i);
  assert.match(query, /p\.entities_id\s+IN\s*\(\$entity\)/);
  assert.match(query, /is_deleted\s*=\s*0/);
  assert.match(query, /is_template\s*=\s*0/);
  assert.match(query, /Sem usuário na equipe/);
  assert.doesNotMatch(query, /pt\.users_id\b/);
  assert.doesNotMatch(query, /glpi_groups_users/);
  assert.match(query, /ORDER BY task_count DESC/);
});
