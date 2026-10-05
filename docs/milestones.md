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

### Milestone 1 runtime / integration validation

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

Scope: Six current-state ticket cards and the Fluxo de chamados time series, based on the verified findings from Milestone 2. The Entity variable filters all cards and the time series. The overdue card uses the GLPI-calculated TTR deadline and the UI-confirmed exclusion of Pending, Solved, and Closed tickets; SLA analysis, TTO/TTR performance metrics, categories, technicians, and backlog aging remain excluded.

### Implemented

- [x] Chamados novos current snapshot (`status = 1`).
- [x] Chamados atribuídos current snapshot (`status = 2`).
- [x] Chamados atrasados current snapshot using non-null, passed GLPI `time_to_resolve`, `solvedate IS NULL`, and `status NOT IN (4, 5, 6)`.
- [x] Chamados solucionados current snapshot (`status = 5`).
- [x] Chamados pendentes current snapshot (`status = 4`).
- [x] Chamados total current snapshot (`is_deleted = 0`).
- [x] Fluxo de chamados time series using Grafana time macros and ordering by time.
- [x] Provisioned six stat cards and one time-series panel.
- [x] Versioned SQL under `sql/queries/`; every query excludes logically deleted tickets and the six snapshots are independent of the time picker.
- [x] Entity variable sourced from `glpi_entities` with `id` as value, `completename` as label, and an All option; SQL filters use the selected entity value.
- [x] Status cards, total, and overdue count compared with the GLPI UI using the same entity scope and considered coherent.

### Milestone 3 runtime / integration validation

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

## Current stable state

The current **GLPI Service Desk** dashboard is functional and runtime validated. Milestones 1, 2, and 3 remain Complete. The post-Milestone 3 SLA improvement and subsequent visual refinements are incorporated. The current state is considered stable; new functionality is outside the immediate scope.

The current Service Desk dashboard is considered stable. Further feature work is deferred; changes should be limited to bug fixes, security, compatibility, or explicitly resumed roadmap work.

## Milestone 4 — Backlog Dashboard

Status: Planned

### Objective

Create a second, independent dashboard dedicated to the health and evolution of the ticket backlog. The existing **GLPI Service Desk** dashboard remains the primary Service Desk view. The new dashboard should help answer how many tickets are currently in the backlog, how long they have been open, whether the queue is growing or shrinking, and where backlog concentration is highest.

The milestone will provision a separate dashboard file, independent of the current dashboard. File name, UID, and final layout are intentionally undecided.

### Initial scope

1. **Current backlog:** count tickets that are not yet solved or closed, with `is_deleted = 0` and the **Entity** variable. The exact SQL definition must be validated before implementation.
2. **Backlog aging:** distribute open tickets into proposed age bands: < 1 day, 1–3 days, 3–7 days, 7–30 days, and > 30 days. Review these bands before implementation.
3. **Backlog trend:** show whether pending work is increasing, decreasing, or stable. Research and validate historical semantics before writing the definitive query.
4. **Backlog by priority:** show the current backlog distribution by priority and avoid unnecessary joins in the initial version.

### Out of scope

- Individual technician productivity or rankings.
- Detailed category metrics.
- Detailed TTO or SLA/TTR analysis.
- Forecasting or composite scores.
- Changes to GLPI.

### Required validation before implementation

Before implementing the dashboard:

1. Confirm semantically what constitutes backlog.
2. Validate the relevant status and filters.
3. Define and validate the historical calculation correctly.
4. Test read-only queries in the test environment.
5. Only then implement and provision the separate dashboard.

No SQL, dashboard, GLPI database, schema, or application changes are included while this milestone is Planned.

## Milestone 5 — Projects Dashboard

Status: Planned

The initial discovery is complete and versioned in [11-projects-schema.sql](../sql/discovery/11-projects-schema.sql), [12-projects-domains.sql](../sql/discovery/12-projects-domains.sql), [13-project-tasks.sql](../sql/discovery/13-project-tasks.sql), and [14-projects-cardinality.sql](../sql/discovery/14-projects-cardinality.sql). No production metric queries have been created, and no Projects dashboard has been implemented. Work will resume in the future from this discovery.

### Initial scope

- An independent dashboard for GLPI projects.
- An `Entity` filter consistent with the current dashboard.
- Project and task views, including states and progress.
- Explicit handling of projects and tasks without a state.
- Possible identification of overdue projects, only after its semantics are validated.
- An operational projects table.

Task metrics must use the parent project's entity scope. Project state value `0` means Sem estado, not active. Complete discovery and validate semantics before creating production queries or implementing the dashboard.
