# Metrics

## Implemented

The provisioned **GLPI Service Desk** dashboard contains seven current-state snapshots and a time series from Milestone 3, plus a Gauge added afterward. Its read-only queries are versioned in `sql/queries/`:

- **Chamados novos:** current tickets with status `1` and `is_deleted = 0`.
- **Chamados atribuídos:** current tickets with status `2` and `is_deleted = 0`.
- **Chamados planejados:** current tickets in Processing (planned), with status `3` and `is_deleted = 0`.
- **Chamados atrasados:** current non-deleted tickets with `status NOT IN (4, 5, 6)`, `solvedate IS NULL`, and a non-null GLPI-calculated TTR deadline `time_to_resolve` earlier than `NOW()`.
- **Chamados solucionados:** current tickets with status `5` and `is_deleted = 0`.
- **Chamados pendentes:** current tickets with status `4` and `is_deleted = 0`.
- **Chamados:** total current tickets with `is_deleted = 0`.
- **Fluxo de chamados:** tickets created by `date` versus solved by `solvedate`, grouped using Grafana's adaptive interval and selected time range, ordered by `time`. **Saldo** is `Criados - Solucionados` in each interval: positive means more tickets entered than were solved, negative means more were solved than entered, and zero means balance in that interval.
- **Eficiência de resolução (SLA):** percentage of solved tickets with an applicable GLPI-calculated TTR deadline that were solved on or before that deadline. This measures TTR compliance among solved tickets, not overall team efficiency.

The dashboard variable **Entity** reads `glpi_entities`, displays `completename` and uses `id` as the selected value. It supports **All** and filters every card and all metric queries; no entity is hardcoded. All six cards are current-state snapshots and do not use the dashboard time picker. The time series is temporal and follows the selected range. Every query filters `is_deleted = 0`. Card queries read directly from the ticket table; the overdue query does not join SLA tables or reconstruct calendar rules. It counts an open ticket as overdue only when GLPI has populated `time_to_resolve` and that deadline is earlier than the database's current time (`NOW()`). Tickets without a computed TTR deadline are not counted as overdue. The query uses the GLPI-calculated deadline as stored, so any applicable SLA calendar is not recomputed separately.

## Eficiência de resolução (SLA) formula

- **Numerator:** solved tickets with `is_deleted = 0`, non-null `solvedate`, and non-null `time_to_resolve` where `solvedate <= time_to_resolve`.
- **Denominator:** all solved tickets with `is_deleted = 0`, non-null `solvedate`, and non-null `time_to_resolve`. Tickets without an applicable TTR deadline and tickets not yet solved are excluded.
- The query respects **Entity** and filters the selected period using `solvedate`. It uses the deadline calculated and stored by GLPI; it does not reconstruct SLA calendars.
- The result is a percentage from 0 to 100. `NULL` means there were no eligible solved tickets in the selected period. The metric represents TTR compliance among solved tickets, not general team efficiency.

## Validation status

Runtime validation of **Eficiência de resolução (SLA)** is complete. The Gauge percentage was compared directly with an equivalent SQL query in the test environment, and both produced the same percentage. The validated calculation uses only non-deleted solved tickets with a non-null GLPI-calculated TTR deadline; it counts a ticket within TTR when `solvedate <= time_to_resolve`, applies the selected Entity and time picker through `solvedate`, and returns `NULL` when no tickets are eligible. No observed percentage, ticket count, entity name, test date, or ticket data is recorded. Existing core metric runtime validation in Grafana is complete. The Entity variable works and all six cards respect the selected entity. Card values were compared with the GLPI UI and considered coherent; the overdue rule matches the behavior validated there. The Chamados card uses compact formatting and the other cards display integer values. Fluxo de chamados runs with Criados, Solucionados, and Saldo, where Saldo = Criados - Solucionados. The time series follows the selected time picker range, while snapshot cards remain independent of it.

Other SLA indicators, TTO metrics, categories, technician metrics, entity metrics beyond selection/filtering, backlog aging, and other metrics are outside Milestone 3 scope and remain future work. The overdue card is only a deadline-based current-state classification; it is not a reconstructed SLA calculation.
