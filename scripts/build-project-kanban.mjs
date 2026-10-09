import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
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
dashboard.links = [{ title: 'Tabela operacional', type: 'link', url: '/d/glpi-projects-detail', targetBlank: false }];
const detailDashboard = structuredClone(dashboard);
detailDashboard.title = 'GLPI Projects — Detalhamento';
detailDashboard.uid = 'glpi-projects-detail';
detailDashboard.description = 'Tabela operacional de projetos para consulta detalhada.';
detailDashboard.panels = [{ ...structuredClone(detailTable), gridPos: { x: 0, y: 0, w: 24, h: 24 } }];
detailDashboard.links = [{ title: 'Voltar ao Kanban', type: 'link', url: '/d/glpi-projects/glpi-projects', targetBlank: false }];
writeFileSync(detailPath, `${JSON.stringify(detailDashboard, null, 2)}\n`);
writeFileSync(dashboardPath, `${JSON.stringify(dashboard, null, 2)}\n`);
console.log(`Built ${dashboardPath} and ${detailPath} from versioned dashboard and Kanban sources.`);
