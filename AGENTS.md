# Repository guidance

- Keep the architecture limited to Grafana and the external GLPI database unless a documented need justifies a change.
- Never commit credentials; keep environment configuration outside Git.
- Do not expose MariaDB without a documented need; the current test host keeps it bound to localhost.
- Preserve read-only database access for Grafana.
- Static validation does not replace runtime or integration validation in the test environment.
- Keep test environment changes reproducible from versioned files and promote them through Git; keep `.env` local to each environment.
- Treat versioned provisioning files as the source of truth for Grafana datasources and dashboards.
- Verify the actual GLPI schema and version before writing metric SQL; document validation and limitations.
- Do not modify the GLPI database, its schema, or GLPI application code.
- Update documentation whenever behavior or configuration changes.
- Prefer straightforward queries and avoid premature abstractions.
