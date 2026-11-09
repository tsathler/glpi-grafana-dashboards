# GLPI Projects layout

The `glpi-projects` dashboard uses native Grafana Stat and horizontal Bar chart panels. It keeps the four existing project indicators, adds four task indicators, and removes the priority distribution and operational project table.

| Section | Panel IDs | `x, y, w, h` |
| --- | --- | --- |
| Project indicators | 11, 1, 2, 4 | `0/6/12/18, 0, 6, 3` |
| Task indicators | 12, 13, 14, 15 | `0/6/12/18, 3, 6, 3` |
| Distributions | 5 Projects by state; 7 Tasks by state | `0, 6, 12, 7`; `12, 6, 12, 7` |
| Team | 16 Tasks by team member | `0, 13, 24, 14` |

All indicators are current snapshots independent of the time picker. Every query uses the selected **Entity**. Task queries use an inner join to the valid parent project, so tasks outside valid projects are excluded; each task joins to one project and at most one state. Project state `0` is labeled **Sem estado**. Finished status is determined by `glpi_projectstates.is_finished`, never by `percent_done`.

Task total and average progress include valid tasks without a state. The unfinished count includes tasks whose state is absent or is not marked finished; the finished count uses `is_finished = 1`. Average progress uses the stored `percent_done` on the GLPI 0–100 scale and is displayed as a percentage. No indicator uses the time picker.

Panel 16 counts valid tasks once for each explicit `User` entry in `glpi_projecttaskteams`. Multiple user members each receive a count for the task. Tasks without any `User` entry appear as **Sem usuário na equipe**; group entries are not expanded. User labels use `firstname` and `realname`, with `Usuário #ID` when the user is unavailable, inactive, deleted, or has no display name. The chart reports task association counts and is not a productivity measure. It uses the parent project's entity scope.

The project-task discovery was supplied as verified against TEST GLPI 11. The new member query has not yet been executed against TEST MariaDB, and integrated Grafana validation remains pending. Static SQL validation is not database validation.
