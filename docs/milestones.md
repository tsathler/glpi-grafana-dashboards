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

The dashboard intentionally contains no functional metrics or queries in this milestone. Its empty state is expected and does not indicate a Milestone 1 failure: it validates the Grafana foundation, provisioning, datasource connectivity, runtime, and persistence only.

### Deferred to Database Discovery and subsequent milestones

Metric and query work depends on verified schema findings from Database Discovery. Later milestones will implement metrics and validate results against GLPI, documenting mappings, filters, and limitations. Do not modify the GLPI database, schema, or application.

## Milestone 2 — Database Discovery

Status: In Progress

Scope: Read-only discovery of the GLPI/MariaDB environment and only the Service Desk structures needed for future metrics. The scripts under `sql/discovery/` are prepared for execution with the dedicated read-only account in the test environment. They have not been run against the database by this documentation/workspace task; no schema conclusions are recorded here.

### Completion criteria

- [ ] GLPI/MariaDB environment identified.
- [ ] `glpi_tickets` schema documented.
- [ ] Actual ticket domain values discovered.
- [ ] User/technician relationship verified.
- [ ] Group relationship verified.
- [ ] Category relationship verified.
- [ ] Entity relationship verified.
- [ ] Lifecycle date semantics investigated.
- [ ] SLA/TTO/TTR fields investigated.
- [ ] Join cardinality risks documented.
- [ ] Representative SQL results compared with GLPI UI.
- [x] No database mutation performed; this task only added documentation and read-only query files.

All SQL prepared for this milestone is limited to `SELECT`, `SHOW`, and `DESCRIBE`. Do not infer meanings for stored values or relationships until observed schema and GLPI UI evidence support them. Do not investigate unrelated inventory modules. Milestone 3 has not started.
