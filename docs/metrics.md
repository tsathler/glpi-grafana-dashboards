# Metrics

## Implemented

Milestone 3 — Core Metrics implements the following read-only queries in `sql/queries/` and panels in the provisioned **GLPI Service Desk** dashboard:

- **Open Tickets:** current non-deleted tickets whose status is not Solved or Closed.
- **New Tickets:** non-deleted tickets whose `date` falls within the selected Grafana time range.
- **Solved Tickets:** non-deleted tickets whose `solvedate` falls within the selected time range.
- **Closed Tickets:** non-deleted tickets whose `closedate` falls within the selected time range.
- **Pending Tickets:** current non-deleted tickets with status Pending.
- **Unassigned Tickets:** current open, non-deleted tickets without a `type = 2` ticket-user relationship. `NOT EXISTS` avoids relationship row multiplication.
- **Created vs Solved:** time series grouped using Grafana's adaptive interval and selected time range, ordered by `time`.

Every metric filters `is_deleted = 0`. Current-state snapshots (Open, Pending, and Unassigned) intentionally do not use the time picker; period metrics do. Period queries use the discovered lifecycle fields and count distinct ticket IDs to protect against join cardinality.

## Validation status

The SQL is statically reviewed and versioned. Query execution, returned values, time-picker behavior, and semantic agreement with the GLPI UI remain pending validation in the test environment. Successful execution alone will not complete Milestone 3; results must be compared with the corresponding GLPI views.

SLA/TTO/TTR, categories, technicians, entities, backlog aging, and other metrics are outside Milestone 3 scope and remain future work.
