# GLPI Projects layout

The `glpi-projects` dashboard uses native Grafana Stat and horizontal Bar chart panels. It keeps the four existing project indicators, adds four task indicators, and removes the priority distribution and operational project table.

| Section | Panel IDs | `x, y, w, h` |
| --- | --- | --- |
| Project indicators | 11, 1, 2, 4 | `0/6/12/18, 0, 6, 3` |
| Task indicators | 12, 13, 14, 15 | `0/6/12/18, 3, 6, 3` |
| Distributions | 5 Projects by state; 7 Tasks by state | `0, 6, 12, 7`; `12, 6, 12, 7` |

All indicators are current snapshots independent of the time picker. Every query uses the selected **Entity**. Task queries use an inner join to the valid parent project, so tasks outside valid projects are excluded; each task joins to one project and at most one state. Project state `0` is labeled **Sem estado**. Finished status is determined by `glpi_projectstates.is_finished`, never by `percent_done`.

Task total and average progress include valid tasks without a state. The unfinished count includes tasks whose state is absent or is not marked finished; the finished count uses `is_finished = 1`. Average progress uses the stored `percent_done` on the GLPI 0–100 scale and is displayed as a percentage. No indicator uses the time picker.

The user assignment chart is not implemented. The repository does not contain verified functional semantics for `glpi_projecttasks.users_id`, `users_id_tech`, or a task-user relationship table. Run the read-only queries in `sql/discovery/15-project-task-assignments.sql` in the target MariaDB and verify field meanings against the GLPI 11 version before adding it. The query set alone cannot establish whether a field means creator, requester, responsible user, or assigned technician.

The project-task discovery and new metric SQL have not been executed against the test MariaDB in this development environment. Static SQL validation is not database validation. Integrated Grafana validation remains pending.
