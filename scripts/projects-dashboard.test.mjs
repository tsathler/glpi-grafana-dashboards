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
  assert.deepEqual(dashboard.panels.map(({ id }) => id), [11, 1, 2, 4, 12, 13, 14, 15, 5, 7]);
  assert.ok(dashboard.panels.every(({ type }) => type === 'stat' || type === 'barchart'));
  assert.deepEqual(dashboard.panels.slice(0, 4).map(({ gridPos }) => [gridPos.x, gridPos.y, gridPos.w, gridPos.h]), [
    [0, 0, 6, 3], [6, 0, 6, 3], [12, 0, 6, 3], [18, 0, 6, 3],
  ]);
  assert.deepEqual(dashboard.panels.slice(4, 8).map(({ gridPos }) => [gridPos.x, gridPos.y, gridPos.w, gridPos.h]), [
    [0, 3, 6, 3], [6, 3, 6, 3], [12, 3, 6, 3], [18, 3, 6, 3],
  ]);
  assert.deepEqual(dashboard.panels.slice(8).map(({ gridPos }) => [gridPos.x, gridPos.y, gridPos.w, gridPos.h]), [
    [0, 6, 12, 7], [12, 6, 12, 7],
  ]);
  assert.ok(dashboard.panels.slice(8).every(({ options }) => options.orientation === 'horizontal'));
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

test('removed table, priority, and unverified user assignment panel stay absent', () => {
  assert.ok(dashboard.panels.every(({ type }) => type !== 'table'));
  assert.ok(dashboard.panels.every(({ title }) => !/prioridade|responsável/i.test(title)));
});
