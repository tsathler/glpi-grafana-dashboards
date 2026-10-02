# Milestone validation status

## Milestone 1 — Foundation

Scope: Grafana Compose service, environment configuration, datasource and dashboard provisioning, persistent data volume, static CI, and validation of the test environment foundation. No GLPI metric SQL is included before schema and version discovery.

Status: Complete

### Completed

- [x] Project structure.
- [x] Grafana Docker Compose service and persistent `grafana-data` volume configuration.
- [x] Provisioning configuration for the MySQL datasource and file-based dashboard provider.
- [x] Dashboard files and provider configuration managed in version control.
- [x] Environment-variable configuration with per-environment `.env` excluded from Git.
- [x] Static CI for `push` and `pull_request`, with only `contents: read` permission.
- [x] Development to GitHub to test promotion flow using `git push` and `git pull`; no manual file transfer.
- [x] Grafana runtime in the test environment: container running, HTTP service and web UI available on TCP/3000, and provisioning loaded.
- [x] MySQL plugin and provisioned **GLPI MySQL** datasource loaded (MySQL, `glpi`, proxy access, SELECT-only database account).
- [x] Datasource health check successful and datasource remains present after Grafana restart.
- [x] **GLPI Service Desk** dashboard provisioned, visible in Grafana, and still present after Grafana restart.
- [x] Expected provisioning and persistence behavior confirmed for the Milestone 1 foundation.
- [x] Direct MariaDB authentication and database access confirmed with read-only access.
- [x] Container host-network access to local MariaDB at `localhost:3306` confirmed.
- [x] MariaDB kept bound to localhost; firewall restricts Grafana TCP/3000 to trusted networks and MariaDB TCP/3306 is not exposed.
- [x] Project documentation aligned with implemented architecture and validation boundaries.
- [x] Repository secrets review completed; see [security.md](security.md).

### Static validation

CI runs Compose configuration, dashboard JSON, YAML and Markdown parsing/linting, Git whitespace checks, and checks that `.env` is not tracked and `.env.example` exists. It does not access the test environment, MariaDB, or GLPI, run real queries, use environment credentials, or deploy. A CI workflow being configured is distinct from a successful hosted workflow run; record hosted results separately. See [development.md](development.md).

### Runtime / integration validation

At the close of Milestone 1, the dashboard intentionally contained no functional metrics or queries. That empty state was expected and did not indicate a Milestone 1 failure: it validated the Grafana foundation, provisioning, datasource connectivity, runtime, and persistence only. Core metrics were added in Milestone 3.

### Deferred to subsequent milestones

Metric and query work depends on the verified schema findings from Milestone 2. Later milestones will implement metrics and validate results against GLPI, documenting mappings, filters, and limitations. Do not modify the GLPI database, schema, or application.

## Milestone 2 — Database Discovery

Status: Complete

Scope: Read-only discovery of the GLPI/MariaDB environment and only the Service Desk structures needed for future metrics. The scripts under `sql/discovery/` were used in the test environment with read-only access. Findings were compared with the GLPI UI; no raw ticket, person, category, entity, or environment-specific values are included here.

### Completion criteria

- [x] GLPI/MariaDB environment identified.
- [x] `glpi_tickets` schema documented.
- [x] Actual ticket domain values discovered.
- [x] User/technician relationship verified.
- [x] Group relationship verified; the relation has no rows in the current environment.
- [x] Category relationship verified.
- [x] Entity relationship verified.
- [x] Lifecycle date semantics investigated.
- [x] SLA/TTO/TTR fields investigated.
- [x] Join cardinality risks documented.
- [x] Representative SQL results compared with GLPI UI and considered coherent.
- [x] No database mutation performed; this task only added documentation and read-only query files.

All discovery SQL is limited to `SELECT`, `SHOW`, and `DESCRIBE`. Do not investigate unrelated inventory modules.

## Milestone 3 — Core Metrics

Status: Complete

Scope: Six current-state ticket cards and the Created vs Solved time series, based on the verified findings from Milestone 2. The Entity variable filters all cards and the time series. The overdue card uses the GLPI-calculated TTR deadline and the UI-confirmed exclusion of Pending, Solved, and Closed tickets; SLA analysis, TTO/TTR performance metrics, categories, technicians, and backlog aging remain excluded.

### Implemented

- [x] Chamados novos current snapshot (`status = 1`).
- [x] Chamados atribuídos current snapshot (`status = 2`).
- [x] Chamados atrasados current snapshot using non-null, passed GLPI `time_to_resolve`, `solvedate IS NULL`, and `status NOT IN (4, 5, 6)`.
- [x] Chamados solucionados current snapshot (`status = 5`).
- [x] Chamados pendentes current snapshot (`status = 4`).
- [x] Chamados total current snapshot (`is_deleted = 0`).
- [x] Created vs Solved time series using Grafana time macros and ordering by time.
- [x] Provisioned six stat cards and one time-series panel.
- [x] Versioned SQL under `sql/queries/`; every query excludes logically deleted tickets and the six snapshots are independent of the time picker.
- [x] Entity variable sourced from `glpi_entities` with `id` as value, `completename` as label, and an All option; SQL filters use the selected entity value.
- [x] Status cards, total, and overdue count compared with the GLPI UI using the same entity scope and considered coherent.

### Runtime / integration validation

- [x] Entity variable validated in Grafana for the selected entity; all six cards respect the selected entity.
- [x] Card values were compared with the GLPI UI and considered coherent.
- [x] Overdue classification reproduces the behavior validated against the GLPI UI.
- [x] The total tickets card uses compact formatting; the other five cards display integer values.
- [x] Fluxo de chamados runs with the Criados, Solucionados, and Saldo series; Saldo is Criados minus Solucionados.
- [x] The time series follows the selected time picker range; current-state cards do not depend on it.
- [x] Dashboard queries execute through the provisioned datasource in the test environment.

Runtime and semantic validation was completed in the test environment against the GLPI UI. Static checks remain part of CI. No database, schema, or index changes are part of this milestone.

### Post-Milestone 3 improvement: Eficiência de resolução (SLA)

This improvement was validated at runtime after Milestone 3 was completed. The Gauge percentage matched a direct SQL calculation in the test environment. Milestone 3 remains Complete; Milestone 4 has not started.
