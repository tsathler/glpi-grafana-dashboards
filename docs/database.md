# Database

## Current state

Milestone 1 provisions a MySQL data source using environment variables. No GLPI schema has been inspected, and no discovery or metric SQL is included. GLPI versions and installations can differ; table or status assumptions must not be made before discovery.

## Access

Create a dedicated read-only account through the database administration process. Example only; adapt the host and database to the environment:

```sql
CREATE USER 'grafana_reader'@'HOST_DO_GRAFANA'
IDENTIFIED BY 'CHANGE_ME';

GRANT SELECT
ON glpi.*
TO 'grafana_reader'@'HOST_DO_GRAFANA';

FLUSH PRIVILEGES;
```

This is documentation only and is not executed by the project. Restrict the account to the required database and Grafana host/network.

## Discovery plan

In the database discovery milestone, record the GLPI version and inspect ticket, status, user, technician, group, category, entity, and date relationships. Validate findings against the actual application before documenting query assumptions.
