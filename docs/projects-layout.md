# GLPI Projects layout

The `glpi-projects` dashboard has its own technical identity: a borderless **DESENVOLVIMENTO** heading with a short cyan underline, gradient Stat cards with their labels and white values together, and a cyan team chart with grid lines hidden. It has two rows of six native Stat panels and one full-width horizontal Bar chart for task team members. The state distribution charts are removed.

| Section | Panel IDs | `x, y, w, h` |
| --- | --- | --- |
| Heading | 17 | `0, 0, 24, 4` |
| Project KPIs | 11, 1, 2, 3, 18, 4 | `0/4/8/12/16/20, 5, 4, 4` |
| Task KPIs | 12, 13, 14, 19, 20, 15 | `0/4/8/12/16/20, 9, 4, 4` |
| Team | 16 Tasks by team member | `0, 14, 24, 14` |

All indicators are current snapshots independent of the time picker and use the selected **Entity**. Task queries use the parent project's entity scope. Project and task records must be valid (`is_deleted = 0`, `is_template = 0`); task joins preserve one row per task.

The status cards use the labels confirmed in the TEST dashboard: **Em andamento** identifies ongoing work, **A Fazer** identifies not-started work, and `glpi_projectstates.is_finished = 1` identifies finished work. Paused projects are grouped with not-started projects when their state label contains `paus`. The **Outros** cards include state `0` (no state) and any remaining non-finished states. A project or task with no state is never treated as ongoing. Average progress uses `percent_done` only for records in **Em andamento**; it is not a completion rate.

Panel 16 counts valid tasks once for each explicit `User` entry in `glpi_projecttaskteams`. Multiple user members each receive a count for the task. Tasks without any `User` entry appear as **Sem usuário na equipe**; group entries are not expanded. User labels use `firstname` and `realname`, with `Usuário #ID` when the user is unavailable, inactive, deleted, or has no display name. The chart reports task association counts and is not a productivity measure. It uses the parent project's entity scope.

The project-task discovery was supplied as verified against TEST GLPI 11. The revised status queries and dashboard layout still require static and integrated validation; the new queries have not been executed against TEST MariaDB. Static SQL validation is not database validation.
