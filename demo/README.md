# Synthetic demo

This optional mode runs the existing Grafana dashboard against a containerized MariaDB database with **100% fictional data**. It does not use, copy, anonymize, or derive records from a real GLPI installation.

## Generate and start

Requirements: Docker Compose and Python 3.12. From the repository root:

```sh
cp .env.demo.example .env.demo
python3 demo/generate.py
docker compose -f compose.demo.yaml up -d
```

If Python is not installed on the host, generate the file with an isolated Python container instead:

```sh
docker run --rm -v "$PWD:/work" -w /work python:3.12-alpine python demo/generate.py
```

Open `http://127.0.0.1:3001` and sign in with the fictional Grafana credentials in the local `.env.demo`. The MariaDB port is not published. Keep `MARIADB_PASSWORD` and `GLPI_DB_PASSWORD` equal if you customize the demo credentials; Grafana uses a dedicated `SELECT`-only database account.

The generator uses seed `20261002` by default and writes the ignored `demo/generated/seed.sql`. It emits 5,000 tickets across 90 days and three fictional entities: **Service Desk**, **Infrastructure**, and **Corporate**. The generated SQL is byte-for-byte repeatable for the same seed. On first database initialization, `@demo_now = NOW()` anchors its relative timestamps to that start time, keeping the default Grafana time range useful. To choose another deterministic seed, run `python3 demo/generate.py --seed NUMBER` before starting the stack.

MariaDB loads the minimal schema, generated rows, and reader grants only when its data volume is empty. Changing `seed.sql` does not update an existing volume.

## Reset

```sh
docker compose -f compose.demo.yaml down -v
python3 demo/generate.py
docker compose -f compose.demo.yaml up -d
```

`down -v` removes only the demo project's containers and named volumes. It does not affect the main Compose stack or any GLPI database.

## Scope and limits

The demo mounts the **same** Grafana provisioning and dashboard JSON as the integrated environment. All panels run the **same** SQL in `sql/queries/`; there are no demo-specific metric queries. The database contains only `glpi_tickets` and `glpi_entities` with the columns currently used by those queries and the Entity selector. It does not model the full GLPI schema, application workflows, users, or SLA calendar engine. TTR deadlines are synthetic stored timestamps chosen to exercise the existing metric logic.

The example passwords are fictional and intended only for a local demo. The generated seed is ignored by Git; do not replace it with real GLPI data.
