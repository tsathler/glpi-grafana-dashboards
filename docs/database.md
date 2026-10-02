# Database

## Current state

Milestone 1 provisions the **GLPI MySQL** datasource using environment variables. It connects to database `glpi` over the local MariaDB service using MySQL proxy access and a read-only account. Datasource health and direct read-only MariaDB connectivity have been validated in the test environment. MariaDB remains bound to `127.0.0.1:3306`; its port is not exposed to the network. Milestone 2 discovered and validated the Service Desk schema relationships documented below. No production metric SQL has been added. Do not generalize these findings to other GLPI installations without validating their schemas.

## Access

The current test host uses the dedicated account `grafana_reader@localhost` with only `SELECT` access on `glpi.*`. It must not have `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER`, or `DROP` privileges. The grant is documented conceptually below; it was applied through the database administration process and is not run by this project:

```sql
GRANT SELECT ON glpi.* TO 'grafana_reader'@'localhost';
```

An earlier account associated with the host's network IP was not sufficient for this local connection. MariaDB is bound to `127.0.0.1:3306`, so do not document or configure it as network-exposed. Other deployments must choose an appropriately restricted account host matching their actual network layout.

## Verified Service Desk discovery findings

Milestone 2 — Database Discovery is complete. Findings were checked against the test environment and compared with the GLPI UI. Only structural findings and domain meanings needed for Service Desk reporting are recorded; raw environment output and ticket data are omitted.

### Tickets and domains

`glpi_tickets` is the central ticket table. For ordinary metrics, use `is_deleted = 0` as the default filter. Confirmed status values are:

| Stored value | Confirmed meaning |
| --- | --- |
| 1 | New |
| 2 | Processing (assigned) |
| 3 | Processing (planned) |
| 4 | Pending |
| 5 | Solved |
| 6 | Closed |

Confirmed ticket types are `1 = Incident` and `2 = Request`.

### Users, technicians, and groups

Ticket-user relationships use `glpi_tickets_users` → `glpi_users`. The confirmed `glpi_tickets_users.type` meanings are `1 = requester`, `2 = assigned/technician`, and `3 = observer`. A ticket can have multiple related users and multiple technicians; queries must preserve that cardinality.

Group relationships use `glpi_groups_tickets` → `glpi_groups`. The relation tables are identified, but the current environment contains no rows for this relationship. Do not infer group assignments or treat this empty relation as evidence that groups are universally unused.

### Categories and entities

Ticket categories relate through `glpi_tickets.itilcategories_id` → `glpi_itilcategories.id`. Categories are hierarchical; use `completename` when a full category path is needed, rather than `name` alone. Tickets may have no category.

Ticket entities relate through `glpi_tickets.entities_id` → `glpi_entities.id`. Multiple entities are present, so do not assume one entity for all tickets.

### Lifecycle and SLA

The validated ticket lifecycle sequence is `date` → `takeintoaccountdate` → `solvedate` → `closedate`. Validate which lifecycle timestamp answers each future metric before using it.

`time_to_own` and `time_to_resolve` are SLA deadlines, not elapsed durations. `takeintoaccount_delay_stat` and `solve_delay_stat` are statistical/effective time fields. SLA interpretation may depend on calendars. Relevant SLA structures include `glpi_slas`, `glpi_slalevels`, `glpi_slalevels_tickets`, `glpi_slalevelactions`, and `glpi_slalevelcriterias`.

### Join cardinality

User and technician, group, category, and entity relations can change row counts when joined. Do not assume a joined result has one row per ticket. Use `COUNT(DISTINCT t.id)` or pre-aggregate each one-to-many relation before combining it with ticket rows, as appropriate to the metric. The exploratory queries in `sql/discovery/10-cardinality.sql` document the discovered cardinality checks.

The test-environment SQL results were compared with the GLPI UI and considered coherent. These findings complete discovery only; they do not implement or validate production dashboard metrics. Exploratory scripts remain in `sql/discovery/` for reproducibility and must be run with read-only access.
