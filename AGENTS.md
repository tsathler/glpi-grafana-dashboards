# Repository guidance

- Keep the architecture limited to Grafana and the external GLPI database unless a documented need justifies a change.
- Keep credentials and real environment details out of Git.
- Preserve read-only database access for Grafana.
- Verify the actual GLPI schema and version before writing metric SQL; document validation and limitations.
- Do not modify the GLPI database, its schema, or GLPI application code.
- Update documentation whenever behavior or configuration changes.
- Prefer straightforward queries and avoid premature abstractions.
