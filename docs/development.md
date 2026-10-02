# Development

## Start and stop

Copy `.env.example` to `.env`, replace placeholders, then run:

```sh
docker compose up -d
docker compose ps
docker compose logs --tail=100 grafana
docker compose down
```

Grafana starts even if the external database is unreachable. In that case the MySQL data source will report a connection error and dashboards have no GLPI data.

## Validate provisioning

Run `docker compose config` to validate Compose interpolation. In Grafana, inspect **Connections → Data sources** and use **Save & test** when the database is available. Inspect the **GLPI** folder for the provisioned dashboard.

Validate dashboard JSON with a JSON parser before committing. Provisioned files are mounted read-only; update the tracked JSON file and restart or wait for Grafana's file watcher to load changes. Export from Grafana only when intentionally updating the versioned dashboard, and remove environment-specific or sensitive values before committing.

Test SQL read-only against a non-production environment first. Compare results with GLPI's own views and document the version, status mapping, filters, and known limitations. Do not infer schema from table names alone.
