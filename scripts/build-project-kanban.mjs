import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dashboardPath = join(root, 'grafana', 'dashboards', 'glpi-projects.json');
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
    mode: 'html',
    content: read('content.html'),
    contentPartials: [],
    renderTemplate: 'all',
    styles: read('styles.css'),
    javascript: {
      beforeContentRendering: read('before-render.js'),
      afterContentReady: '',
    },
  },
});
dashboard.panels.find((panel) => panel.id === 8).gridPos.y = 44;
dashboard.panels.sort((a, b) => a.gridPos.y - b.gridPos.y || a.gridPos.x - b.gridPos.x);
writeFileSync(dashboardPath, `${JSON.stringify(dashboard, null, 2)}\n`);
console.log(`Built ${dashboardPath} from versioned Kanban presentation files.`);
