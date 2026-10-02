# Metrics

## Implemented

Milestone 3 — Core Metrics implements six current-state snapshots and one time series using read-only queries in `sql/queries/` and panels in the provisioned **GLPI Service Desk** dashboard:

- **Chamados novos:** current tickets with status `1` and `is_deleted = 0`.
- **Chamados atribuídos:** current tickets with status `2` and `is_deleted = 0`.
- **Chamados atrasados:** current non-deleted tickets with `status NOT IN (4, 5, 6)`, `solvedate IS NULL`, and a non-null GLPI-calculated TTR deadline `time_to_resolve` earlier than `NOW()`.
- **Chamados solucionados:** current tickets with status `5` and `is_deleted = 0`.
- **Chamados pendentes:** current tickets with status `4` and `is_deleted = 0`.
- **Chamados:** total current tickets with `is_deleted = 0`.
- **Fluxo de chamados:** tickets created by `date` versus solved by `solvedate`, grouped using Grafana's adaptive interval and selected time range, ordered by `time`. **Saldo** is `Criados - Solucionados` in each interval: positive means more tickets entered than were solved, negative means more were solved than entered, and zero means balance in that interval.

The dashboard variable **Entity** reads `glpi_entities`, displays `completename` and uses `id` as the selected value. It supports **All** and filters every card and both branches of the time series; no entity is hardcoded. All six cards are current-state snapshots and do not use the dashboard time picker. The time series is temporal and follows the selected range. Every query filters `is_deleted = 0`. Card queries read directly from the ticket table; the overdue query does not join SLA tables or reconstruct calendar rules. It counts an open ticket as overdue only when GLPI has populated `time_to_resolve` and that deadline is earlier than the database's current time (`NOW()`). Tickets without a computed TTR deadline are not counted as overdue. The query uses the GLPI-calculated deadline as stored, so any applicable SLA calendar is not recomputed separately.

## Validation status

The SQL is statically reviewed and versioned. Against the GLPI UI, the status cards, total, and overdue count were compared and considered coherent using the same entity scope. The Entity variable and its All/specific-entity behavior still require validation in Grafana; query execution and time-picker behavior for Created vs Solved also remain pending validation in the test environment. Successful execution alone will not complete Milestone 3; results must be compared with the corresponding GLPI views.

SLA duration/performance indicators, TTO metrics, categories, technician metrics, entity metrics beyond selection/filtering, backlog aging, and other metrics are outside Milestone 3 scope and remain future work. The overdue card is only a deadline-based current-state classification; it is not a reconstructed SLA calculation.
