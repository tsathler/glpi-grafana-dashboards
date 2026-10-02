# Milestone validation status

## Milestone 1: Grafana foundation

Scope: Grafana Compose service, environment-based configuration, provisioned MySQL data source, and placeholder dashboard. No GLPI metric SQL is included because the installed GLPI version and database schema have not been inspected.

### Static validation

GitHub Actions now runs static checks on pushes and pull requests: Compose configuration, dashboard JSON, YAML syntax, Markdown lint, Git whitespace, and `.env` tracking / `.env.example` presence. This is static validation only; it does not run Grafana or connect to GLPI. Local results for each revision should still be recorded separately. See [development.md](development.md).

### Runtime / integration validation

Status: pending until performed in the test environment after `git pull`. This repository review does not establish that Grafana was started against the test environment or that its external GLPI database is reachable. The test operator must record the date, environment, and outcomes for:

- Compose configuration and Grafana startup/logs.
- Data source provisioning and database connectivity.
- Dashboard provisioning.
- Query execution and comparison of metric values against GLPI (pending until verified schema-based metric queries exist).
- State persistence after restart.

Do not mark the milestone fully integration-validated until applicable checks have evidence. A static validation result must not be reported as a runtime or metric validation result.
