import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { generateProjectDeployment, validateBaseUrl } from './build-project-deployment.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function fixture(t, config) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'glpi-dashboards-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const dashboards = path.join(root, 'grafana', 'dashboards');
  const local = path.join(root, 'grafana', 'dashboards-local');
  await mkdir(dashboards, { recursive: true });
  await mkdir(local, { recursive: true });
  await cp(path.join(repoRoot, 'grafana', 'dashboards', 'glpi-projects.json'), path.join(dashboards, 'glpi-projects.json'));
  if (config !== undefined) await writeFile(path.join(root, 'grafana', 'glpi-url.local.json'), JSON.stringify(config));
  return { root, dashboards, local };
}

test('generates the consolidated local dashboard with a literal Grafana value expression', async (t) => {
  const { root, dashboards, local } = await fixture(t, { baseUrl: 'https://glpi.example.test/portal/' });
  await writeFile(path.join(local, 'glpi-projects-detail.json'), '{}');
  const original = await readFile(path.join(dashboards, 'glpi-projects.json'), 'utf8');

  await generateProjectDeployment(root);

  const main = JSON.parse(await readFile(path.join(local, 'glpi-projects.json'), 'utf8'));
  const link = main.panels.flatMap((panel) => panel.fieldConfig?.overrides ?? [])
    .flatMap((override) => override.properties ?? [])
    .filter((property) => property.id === 'links')
    .flatMap((property) => property.value ?? [])[0];
  assert.equal(link.url, 'https://glpi.example.test/portal/front/project.form.php?id=${__value.raw}');
  assert.equal(await readFile(path.join(dashboards, 'glpi-projects.json'), 'utf8'), original);
  await assert.rejects(readFile(path.join(local, 'glpi-projects-detail.json'), 'utf8'), { code: 'ENOENT' });
});

test('generation is repeatable', async (t) => {
  const { root, local } = await fixture(t, { baseUrl: 'https://glpi.example.test' });
  await generateProjectDeployment(root);
  const first = await readFile(path.join(local, 'glpi-projects.json'), 'utf8');
  await generateProjectDeployment(root);
  const second = await readFile(path.join(local, 'glpi-projects.json'), 'utf8');
  assert.deepEqual(second, first);
});

test('missing and invalid local URL configuration fail clearly', async (t) => {
  const missing = await fixture(t);
  await assert.rejects(generateProjectDeployment(missing.root), /Missing local GLPI URL config/);
  const malformed = await fixture(t);
  await writeFile(path.join(malformed.root, 'grafana', 'glpi-url.local.json'), '{invalid');
  await assert.rejects(generateProjectDeployment(malformed.root), /Malformed JSON/);
  for (const baseUrl of ['javascript:alert(1)', 'https://user:secret@glpi.example.test', 'https://glpi.example.test/?x=1']) {
    assert.throws(() => validateBaseUrl(baseUrl), /GLPI base URL must use http\(s\)/);
  }
  const invalid = await fixture(t, { baseUrl: '' });
  await assert.rejects(generateProjectDeployment(invalid.root), /Missing GLPI base URL/);
});

test('project SQL files match their dashboard queries', async () => {
  const dashboard = JSON.parse(await readFile(path.join(repoRoot, 'grafana', 'dashboards', 'glpi-projects.json'), 'utf8'));
  const panels = dashboard.panels;
  for (const id of [1, 2, 4, 5, 6, 7, 8, 11]) {
    const panel = panels.find((item) => item.id === id && item.targets?.some((target) => target.refId === 'A'));
    const name = (await readdir(path.join(repoRoot, 'sql', 'projects', 'queries')))
      .find((filename) => filename.startsWith(`${String(id).padStart(2, '0')}-`));
    assert.ok(panel, `Missing dashboard panel ${id}`);
    assert.ok(name, `Missing SQL file for panel ${id}`);
    const sql = await readFile(path.join(repoRoot, 'sql', 'projects', 'queries', name), 'utf8');
    assert.equal(panel.targets.find((target) => target.refId === 'A').rawSql.trim(), sql.trim(), `SQL mismatch for panel ${id}`);
  }
  assert.equal(panels.filter((panel) => panel.type === 'table').length, 1);
});
