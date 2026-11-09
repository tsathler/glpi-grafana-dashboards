import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dashboard = JSON.parse(await readFile(path.join(root, 'grafana/dashboards/glpi-projects.json'), 'utf8'));
const sqlDirectory = path.join(root, 'sql/projects/queries');

test('project dashboard has the expected native panels and 24-column layout', async () => {
  assert.equal(dashboard.uid, 'glpi-projects');
  assert.deepEqual(dashboard.panels.map(({ id }) => id), [11, 1, 2, 4, 12, 13, 14, 15, 5, 7, 16]);
  assert.ok(dashboard.panels.every(({ type }) => type === 'stat' || type === 'barchart'));
  assert.deepEqual(dashboard.panels.slice(0, 4).map(({ gridPos }) => [gridPos.x, gridPos.y, gridPos.w, gridPos.h]), [
    [0, 0, 6, 3], [6, 0, 6, 3], [12, 0, 6, 3], [18, 0, 6, 3],
  ]);
  assert.deepEqual(dashboard.panels.slice(4, 8).map(({ gridPos }) => [gridPos.x, gridPos.y, gridPos.w, gridPos.h]), [
    [0, 3, 6, 3], [6, 3, 6, 3], [12, 3, 6, 3], [18, 3, 6, 3],
  ]);
  assert.deepEqual(dashboard.panels.slice(8, 10).map(({ gridPos }) => [gridPos.x, gridPos.y, gridPos.w, gridPos.h]), [
    [0, 6, 12, 7], [12, 6, 12, 7],
  ]);
  assert.deepEqual(dashboard.panels[10].gridPos, { x: 0, y: 13, w: 24, h: 14 });
  assert.equal(dashboard.panels[10].title, 'Tarefas por membro da equipe');
  assert.ok(dashboard.panels.slice(8).every(({ type, options }) => type === 'barchart' && options.orientation === 'horizontal'));
  assert.ok(dashboard.panels.every(({ targets }) => targets.length === 1));
});

test('project dashboard query text matches the versioned SQL mapped by panel ID', async () => {
  const entries = await import('node:fs/promises').then(({ readdir }) => readdir(sqlDirectory));
  for (const panel of dashboard.panels) {
    const matches = entries.filter((name) => name.startsWith(`${String(panel.id).padStart(2, '0')}-`));
    assert.equal(matches.length, 1, `expected one SQL file for panel ${panel.id}`);
    assert.equal(panel.targets[0].rawSql.trim(), (await readFile(path.join(sqlDirectory, matches[0]), 'utf8')).trim());
  }
});

test('removed table and priority chart stay absent', () => {
  assert.ok(dashboard.panels.every(({ type }) => type !== 'table'));
  assert.ok(dashboard.panels.every(({ title }) => !/prioridade/i.test(title)));
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
