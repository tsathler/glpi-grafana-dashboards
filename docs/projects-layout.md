# GLPI Projects layout

The `glpi-projects` dashboard has its own technical identity: a compact borderless **DESENVOLVIMENTO** heading with a short cyan underline, two numbered sections, ten equal-width Stat cards, and two percentage Gauges. Each five-card row uses Grafana V2 Auto grid so the cards fill the available width with consistent gutters instead of explicit blank grid columns. The Gauges use the Service Desk visual style with fixed purple coloring; SLA thresholds are not reused. The brighter palette follows the Service Desk colors while retaining project and task status meanings. The team distribution chart is removed so the dashboard focuses on consolidated numeric indicators rather than operational tracking. The state distribution charts are removed.

| Section | Panel IDs | Layout |
| --- | --- | --- |
| Heading | 17 | Full-width grid row |
| Project section label | 21 | Full-width grid row |
| Project KPIs | 11, 1, 2, 3, 18 | Auto grid, up to five equal columns |
| Task section label | 22 | Full-width grid row |
| Task KPIs | 12, 13, 14, 19, 20 | Auto grid, up to five equal columns |
| Progress Gauges | 4, 15 | Auto grid, up to two equal columns |

The dashboard file uses Grafana's `dashboard.grafana.app/v2` resource format because Auto grid is not represented by the classic 24-column `gridPos` layout. Grafana 13.2.2 supports provisioning dashboards in this resource format.

All indicators are current snapshots independent of the time picker and use the selected **Entity**. Task queries use the parent project's entity scope. Project and task records must be valid (`is_deleted = 0`, `is_template = 0`); task joins preserve one row per task.

The status cards use the labels confirmed in the TEST dashboard: **Em andamento** identifies ongoing work, **A Fazer** identifies not-started work, and `glpi_projectstates.is_finished = 1` identifies finished work. Paused projects are grouped with not-started projects when their state label contains `paus`. The **Outros** cards include state `0` (no state) and any remaining non-finished states. A project or task with no state is never treated as ongoing. Average progress uses `percent_done` only for records in **Em andamento**; it is not a completion rate.

The project-task discovery was supplied as verified against TEST GLPI 11. The revised status queries and dashboard layout still require static and integrated validation; the new queries have not been executed against TEST MariaDB. Static SQL validation is not database validation.
