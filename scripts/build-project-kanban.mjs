import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2] ?? '--safe';
if (!['--safe', '--check', '--force'].includes(mode)) {
  throw new Error('Usage: node scripts/build-project-kanban.mjs [--safe|--check|--force]');
}
const dashboardPath = join(root, 'grafana', 'dashboards', 'glpi-projects.json');
const detailPath = join(root, 'grafana', 'dashboards', 'glpi-projects-detail.json');
const presentation = join(root, 'grafana', 'dashboards', 'project-kanban');
const read = (name) => readFileSync(join(presentation, name), 'utf8').replace(/\r\n/g, '\n').trim();
const dashboard = JSON.parse(readFileSync(dashboardPath, 'utf8'));
const panelId = 9;

dashboard.panels = dashboard.panels.filter((panel) => panel.id !== panelId);
dashboard.panels.push({
  id: panelId,
  title: 'Kanban de projetos',
  type: 'marcusolsson-dynamictext-panel',
  description: 'Projetos agrupados pelos estados cadastrados no GLPI. Progresso não determina o estado de conclusão.',
  gridPos: { x: 0, y: 26, w: 24, h: 18 },
  pluginVersion: '6.3.0',
  datasource: { type: 'mysql', uid: 'glpi-mysql' },
  targets: [{ rawSql: readFileSync(join(root, 'sql', 'projects', 'queries', '09-project-kanban.sql'), 'utf8').replace(/^\uFEFF/, ''), refId: 'A', format: 'table' }],
  fieldConfig: { defaults: {}, overrides: [] },
  options: {
    content: read('content.html'),
    contentPartials: [],
    renderMode: 'allRows',
    styles: read('styles.css'),
    helpers: read('before-render.js'),
    editors: ['default', 'helpers', 'styles', 'afterRender'],
    editor: { format: 'html', language: 'html' },
    afterRender: '',
  },
});
const positions = new Map([
  [10, { x: 0, y: 0, w: 24, h: 2 }],
  [1, { x: 0, y: 2, w: 6, h: 3 }],
  [2, { x: 6, y: 2, w: 6, h: 3 }],
  [3, { x: 12, y: 2, w: 6, h: 3 }],
  [4, { x: 18, y: 2, w: 6, h: 3 }],
  [5, { x: 0, y: 5, w: 8, h: 5 }],
  [6, { x: 8, y: 5, w: 8, h: 5 }],
  [7, { x: 16, y: 5, w: 8, h: 5 }],
  [9, { x: 0, y: 10, w: 24, h: 16 }],
  [8, { x: 0, y: 28, w: 24, h: 12 }],
]);
for (const panel of dashboard.panels) {
  if (positions.has(panel.id)) panel.gridPos = positions.get(panel.id);
}
dashboard.panels.sort((a, b) => a.gridPos.y - b.gridPos.y || a.gridPos.x - b.gridPos.x);
const detailTable = JSON.parse(read('operational-table-panel.json'));
detailTable.targets[0].rawSql = readFileSync(
  join(root, 'sql', 'projects', 'queries', '08-projects-operational-table.sql'),
  'utf8',
).replace(/^\uFEFF/, '');
dashboard.panels = dashboard.panels.filter((panel) => panel.id !== 8);
dashboard.links = [{
  title: 'Tabela operacional',
  type: 'dashboards',
  url: '/d/glpi-projects-detail',
  includeVars: true,
  keepTime: true,
  targetBlank: false,
}];
const detailDashboard = structuredClone(dashboard);
detailDashboard.title = 'GLPI Projects — Detalhamento';
detailDashboard.uid = 'glpi-projects-detail';
detailDashboard.description = 'Tabela operacional de projetos para consulta detalhada.';
detailDashboard.panels = [{ ...structuredClone(detailTable), gridPos: { x: 0, y: 0, w: 24, h: 18 } }];
detailDashboard.links = [{
  title: 'Voltar ao Kanban',
  type: 'dashboards',
  url: '/d/glpi-projects/glpi-projects',
  includeVars: true,
  keepTime: true,
  targetBlank: false,
}];
const syncProjectQueries = (panels) => {
  const queryFiles = new Map([
    [1, '01-open-projects.sql'], [2, '02-finished-projects.sql'],
    [3, '03-projects-without-state.sql'], [4, '04-average-project-progress.sql'],
    [5, '05-projects-by-state.sql'], [6, '06-projects-by-priority.sql'],
    [7, '07-tasks-by-state.sql'], [8, '08-projects-operational-table.sql'],
    [9, '09-project-kanban.sql'],
  ]);
  for (const panel of panels) {
    const queryFile = queryFiles.get(panel.id);
    if (!queryFile) continue;
    const target = panel.targets?.find((item) => item.refId === 'A');
    if (!target) throw new Error(`Project panel ${panel.id} is missing query target A`);
    const queryPath = join(root, 'sql', 'projects', 'queries', queryFile);
    target.rawSql = readFileSync(queryPath, 'utf8').replace(/^\uFEFF/, '');
  }
};
syncProjectQueries(dashboard.panels);
syncProjectQueries(detailDashboard.panels);
const outputs = new Map([
  [detailPath, `${JSON.stringify(detailDashboard, null, 2)}\n`],
  [dashboardPath, `${JSON.stringify(dashboard, null, 2)}\n`],
]);
if (mode === '--check') {
  const differences = [...outputs].filter(([path, content]) => {
    try { return readFileSync(path, 'utf8') !== content; } catch { return true; }
  }).map(([path]) => path);
  if (differences.length) throw new Error(`Generated dashboard output differs: ${differences.join(', ')}`);
  console.log('OK: generated project dashboards match their sources.');
} else {
  const conflicts = [...outputs].filter(([path, content]) => {
    try { return readFileSync(path, 'utf8') !== content; } catch { return false; }
  }).map(([path]) => path);
  if (mode === '--safe' && conflicts.length) {
    throw new Error(`Refusing to overwrite changed dashboards; inspect with --check, then use --force intentionally: ${conflicts.join(', ')}`);
  }
  for (const [path, content] of outputs) writeFileSync(path, content);
  console.log(`Built ${dashboardPath} and ${detailPath} from versioned dashboard and Kanban sources.`);
}
