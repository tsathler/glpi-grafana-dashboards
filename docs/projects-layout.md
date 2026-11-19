# GLPI Projects layout

Status: Validado em homologação e produção em 2026-11-19; congelado para novas funcionalidades.

The `glpi-projects` dashboard follows the Service Desk appearance: a compact **PAINEL DE ENGENHARIA / DESENVOLVIMENTO** heading in the theme text color with a short cyan underline, two numbered section labels (**01 PROJETOS**, **02 TAREFAS**), twelve solid-color Stat cards, and two percentage Gauges. Headings and section labels use the theme text color, so they are readable in light and dark themes. Like the Service Desk, each section puts its main content on the left two thirds and its Gauge on the right third, so the progress indicator sits next to the cards it summarizes. The whole dashboard fits a 1920×1080 screen without scrolling.

| Section | Panel IDs | Layout (24-column grid inside the row) |
| --- | --- | --- |
| Heading | 17 | Full width |
| Project section label | 21 | Full width |
| Project KPIs and Gauge | 11, 1, 3 / 5, 2, 18 and 4 | Cards in a 3 × 2 grid, 5 columns × 4 rows each; Gauge at x 15, 9 columns × 8 rows |
| Task section label | 22 | Full width |
| Task KPIs and Gauge | 12, 13, 19 / 16, 14, 20 and 15 | Same as projects |

Each card grid reads Total, Em andamento, Não iniciados in the first row and Pausados, Finalizados, Sem estado in the second, using the Service Desk palette: blue, teal, purple, amber, green and slate. The Gauges use a fixed purple color with a thick arc (`barWidthFactor` 0.8); SLA thresholds are not reused.

The dashboard file uses Grafana's `dashboard.grafana.app/v2` resource format, with a `RowsLayout` whose rows hold `GridLayout` items. Grafana 13.2.2 provisions dashboards in this resource format. When loading it, Grafana 13.2.2 logs `[SHOULD NOT HAPPEN] failed to update managedFields` for `glpi-projects`; the dashboard still loads and renders, so the message is treated as a known Grafana issue.

All indicators are current snapshots independent of the time range, so the time picker is hidden; the dashboard refreshes every 5 minutes. They use the selected **Entity**, which accepts only values from its list. Task queries use the parent project's entity scope. Project and task records must be valid (`is_deleted = 0`, `is_template = 0`); task joins preserve one row per task.

The status groups partition the records, so the five group cards add up to **Total**. **Finalizados** uses `glpi_projectstates.is_finished = 1`. **Não iniciados** matches `A Fazer` (TEST) and `Não Inicializado` (production). **Pausados** matches states whose name contains `paus`. **Em andamento** is every other non-finished state, including intermediate phases such as Design, Revisão de código and Fase de teste. **Sem estado** covers `projectstates_id = 0` and missing states; a record with no state is never treated as ongoing. Average progress uses `percent_done` only for records in **Em andamento**; it is not a completion rate.

The production state list was checked on 2026-11-19. The revised queries were first checked in a local preview with synthetic data and the production states. On 2026-11-19 the dashboard was deployed to TEST and production, and each group card matched an equivalent SQL count per group with Entity set to All in both environments. Average progress was not compared separately.
