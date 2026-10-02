# GLPI Service Desk Dashboard

[![CI](https://github.com/tsathler/glpi-service-desk-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/tsathler/glpi-service-desk-dashboard/actions/workflows/ci.yml)

Operational dashboard foundation for a GLPI database, using Grafana and its native MySQL data source. The GLPI database is external; this repository runs Grafana only.

## Overview

Milestones 1 and 2 are complete. Milestone 3 — Core Metrics is in progress, with seven read-only ticket metrics provisioned in the **GLPI Service Desk** dashboard. Validate their results against the GLPI UI in the test environment before considering the milestone complete. See [docs/database.md](docs/database.md) for the confirmed schema findings and [docs/metrics.md](docs/metrics.md) for metric definitions.

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

The provisioned **GLPI Service Desk** dashboard includes six stat cards and a **Created vs Solved** time series for the Milestone 3 core metrics. Further metric categories remain out of scope.

## Metrics

Metric definitions and planned scope are documented in [docs/metrics.md](docs/metrics.md). No SQL metric queries are included until schema discovery.

## Security

See [docs/security.md](docs/security.md). The current test setup keeps MariaDB bound to localhost and uses a dedicated read-only account.

## Validation

GitHub Actions runs static validation on pushes and pull requests: Compose configuration, dashboard JSON, YAML syntax, Markdown, Git whitespace, and checks that `.env` is not tracked and `.env.example` exists. This does not validate runtime or database integration. The test environment remains responsible for those checks after `git pull`; see [docs/development.md](docs/development.md) and [docs/milestones.md](docs/milestones.md).

## Limitations

The implemented queries and dashboard panels still require runtime and semantic validation in the test environment against the GLPI UI. Static SQL and JSON validation does not establish metric correctness.

## Roadmap

Milestone 1: Foundation (complete). Milestone 2: Database Discovery (complete). Milestone 3: Core Metrics (in progress; test-environment validation pending).
