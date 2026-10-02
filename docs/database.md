# Database

## Current state

Milestone 1 provisions the **GLPI MySQL** datasource using environment variables. It connects to database `glpi` over the local MariaDB service using MySQL proxy access and a read-only account. Datasource health and direct read-only MariaDB connectivity have been validated in the test environment. MariaDB remains bound to `127.0.0.1:3306`; its port is not exposed to the network. No GLPI schema has been discovered and no metric SQL is included. GLPI versions and installations can differ; table or status assumptions must not be made before discovery.

## Access

The current test host uses the dedicated account `grafana_reader@localhost` with only `SELECT` access on `glpi.*`. It must not have `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER`, or `DROP` privileges. The grant is documented conceptually below; it was applied through the database administration process and is not run by this project:

```sql
GRANT SELECT ON glpi.* TO 'grafana_reader'@'localhost';
```

An earlier account associated with the host's network IP was not sufficient for this local connection. MariaDB is bound to `127.0.0.1:3306`, so do not document or configure it as network-exposed. Other deployments must choose an appropriately restricted account host matching their actual network layout.

## Discovery plan

In the database discovery milestone, record the GLPI version and inspect ticket, status, user, technician, group, category, entity, and date relationships. Validate findings against the actual application before documenting query assumptions.
