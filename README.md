# GLPI Service Desk Dashboard

[![CI](https://github.com/tsathler/glpi-service-desk-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/tsathler/glpi-service-desk-dashboard/actions/workflows/ci.yml)

Operational dashboard foundation for a GLPI database, using Grafana and its native MySQL data source. The GLPI database is external; this repository runs Grafana only.

## Overview

Milestone 1 — Foundation is complete: Grafana, the read-only MySQL datasource, dashboard provisioning, runtime, and persistence were validated in the test environment. The **GLPI Service Desk** dashboard is intentionally empty in this phase; metrics and functional queries belong to Database Discovery and subsequent milestones.

## Goals

Provide a simple, reproducible base for future operational ticket metrics while keeping credentials out of Git and database access read-only.

## Architecture

See [docs/architecture.md](docs/architecture.md).

## Features

- Pinned Grafana OSS image (`13.2.2`)
- Persistent Grafana data volume
- Provisioned MySQL data source and dashboard
- Environment-based configuration

## Stack

Docker Compose, Grafana, MySQL/MariaDB data source, SQL.

## Repository Structure

See the repository tree and [docs/development.md](docs/development.md).

## Requirements

Docker Engine and Docker Compose plugin. A reachable MySQL/MariaDB GLPI database is needed for data queries, but not for Grafana to start.

## Configuration

Each environment keeps its own local `.env`. Copy `.env.example` to `.env` and replace every placeholder on the development machine and again on the test environment. Only `.env.example` is versioned; never commit `.env` or environment-specific values.

## Database Access

Use a dedicated database account with `SELECT` permission only. See [docs/security.md](docs/security.md) and [docs/database.md](docs/database.md).

## Running

```sh
docker compose up -d
```

Open `http://localhost:3000` and sign in with the configured Grafana admin credentials. See [docs/development.md](docs/development.md) for operations and validation.

See [docs/development.md](docs/development.md) for test environment setup and deployment instructions.

## Dashboard

The provisioned **GLPI Service Desk** dashboard is a minimal placeholder; no metrics are implemented in Milestone 1.

## Metrics

Metric definitions and planned scope are documented in [docs/metrics.md](docs/metrics.md). No SQL metric queries are included until schema discovery.

## Security

See [docs/security.md](docs/security.md). The current test setup keeps MariaDB bound to localhost and uses a dedicated read-only account.

## Validation

GitHub Actions runs static validation on pushes and pull requests: Compose configuration, dashboard JSON, YAML syntax, Markdown, Git whitespace, and checks that `.env` is not tracked and `.env.example` exists. This does not validate runtime or database integration. The test environment remains responsible for those checks after `git pull`; see [docs/development.md](docs/development.md) and [docs/milestones.md](docs/milestones.md).

## Limitations

The database schema, GLPI version, ticket statuses, and metric semantics have not been discovered or validated. The dashboard therefore displays no ticket data.

## Roadmap

Milestone 1: foundation. Next, review the foundation, then perform database discovery as a separate milestone.
