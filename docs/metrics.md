# Metrics

## Implemented

Milestone 3 — Core Metrics implements six current-state snapshots and one time series using read-only queries in `sql/queries/` and panels in the provisioned **GLPI Service Desk** dashboard:

- **Chamados novos:** current tickets with status `1` and `is_deleted = 0`.
- **Chamados atribuídos:** current tickets with status `2` and `is_deleted = 0`.
- **Chamados atrasados:** current non-deleted tickets not in solved/closed statuses (`5`, `6`) whose GLPI-calculated TTR deadline `time_to_resolve` is non-null and earlier than `NOW()`.
- **Chamados solucionados:** current tickets with status `5` and `is_deleted = 0`.
- **Chamados pendentes:** current tickets with status `4` and `is_deleted = 0`.
- **Chamados:** total current tickets with `is_deleted = 0`.
- **Created vs Solved:** tickets created by `date` versus solved by `solvedate`, grouped using Grafana's adaptive interval and selected time range, ordered by `time`.

All six cards are current-state snapshots and do not use the dashboard time picker. The time series is temporal and follows the selected range. Every query filters `is_deleted = 0`. Card queries read directly from the ticket table; the overdue query does not join SLA tables or reconstruct calendar rules. It counts an open ticket as overdue only when GLPI has populated `time_to_resolve` and that deadline is earlier than the database's current time (`NOW()`). Tickets without a computed TTR deadline are not counted as overdue. The query uses the GLPI-calculated deadline as stored, so any applicable SLA calendar is not recomputed separately.

## Validation status

The SQL is statically reviewed and versioned. Query execution, returned values, time-picker behavior, and semantic agreement with the GLPI UI remain pending validation in the test environment. Successful execution alone will not complete Milestone 3; results must be compared with the corresponding GLPI views.

SLA duration/performance indicators, TTO metrics, categories, technicians, entities, backlog aging, and other metrics are outside Milestone 3 scope and remain future work. The overdue card is only a deadline-based current-state classification; it is not a reconstructed SLA calculation.
