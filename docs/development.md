# Development and deployment

## Environment separation

The development machine prepares and validates repository files. It is not assumed to have access to the GLPI database or the integrated test environment. Development and test each keep a separate local `.env`, created from `.env.example`; `.env` is not versioned, and credentials must never be copied through Git or written into documentation.

The test environment receives changes through Git. This repository deploys Grafana only; the GLPI database remains external, and Grafana must use a read-only database account.

## Test environment setup

### Prerequisites

The test environment currently used by this project is **Ubuntu Server 24.04 LTS**, with Git, Docker Engine, and the Docker Compose plugin. Other Linux distributions may work, but Ubuntu Server 24.04 LTS is the environment documented here.

The current test host runs Grafana and MariaDB together. MariaDB listens only on `127.0.0.1:3306`; it is not exposed on the network. Docker was installed from Docker's official APT repository. The `docker-ce has no installation candidate` issue was resolved by configuring that repository; see the troubleshooting section below for the diagnostic steps.

### Install Docker Engine and Compose plugin

These commands require administrative privileges. Run them as `root`, or open a root shell with `sudo -i` first. If running commands individually as a non-root user, prefix administrative commands with `sudo`.

Install the prerequisites and add Docker's official Ubuntu APT repository and signing key:

```bash
apt update
apt install -y ca-certificates curl

install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc

chmod a+r /etc/apt/keyrings/docker.asc

cat > /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

apt update
```

Install Docker Engine, CLI, containerd, Buildx, and the modern Compose plugin:

```bash
apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin
```

Use Compose as `docker compose`. These instructions do not use `snap install docker` or the legacy `docker-compose` package.

### Verify the installation

Run:

```bash
docker --version
docker compose version
systemctl status docker --no-pager
docker run --rm hello-world
```

The first command checks the Docker CLI, the second checks the Compose plugin, `systemctl` reports the Docker daemon status, and `hello-world` verifies that the daemon can run a container. The last command may require `sudo` if the current user does not have permission to access Docker.

### Troubleshooting: `docker-ce` has no installation candidate

This occurred because Docker's official repository was not configured in APT. The test host was fixed by adding Docker's official repository and refreshing package metadata as shown above. If it recurs, refresh package metadata:

```bash
apt update
```

Confirm the output includes `https://download.docker.com/linux/ubuntu`, then inspect the available package candidate:

```bash
apt-cache policy docker-ce
```

If there is no `Candidate`, review `/etc/apt/sources.list.d/docker.sources` and repeat `apt update` after correcting the repository configuration.

### Clone or update the project

For this test environment, `/opt` is the chosen installation location; it is not required. For the first clone:

```bash
cd /opt
git clone https://github.com/tsathler/glpi-service-desk-dashboard.git
cd glpi-service-desk-dashboard
```

For later updates, pull the new revision:

```bash
cd /opt/glpi-service-desk-dashboard
git pull
```

### Configure the local environment

On the test environment, create its local configuration and edit it:

```bash
cp .env.example .env
nano .env
```

Set values appropriate to that environment. Never commit `.env`: development and test have separate local copies, credentials are not transferred through Git, and real credentials or host details must not be added to documentation.

### Start the project

From the project directory, run:

```bash
docker compose config
docker compose up -d
docker compose ps
docker compose logs --tail=100 grafana
```

`config` validates and renders the Compose configuration; `up -d` starts the services in the background; `ps` shows their state; and `logs` helps inspect Grafana startup, provisioning, and errors.

The current Compose service uses `network_mode: host`, so it does not use a `ports` mapping. This was chosen for the current test setup: Grafana and MariaDB share a Linux host, and MariaDB remains bound to localhost. Container-to-`localhost:3306` reachability has been validated. Grafana's web interface listens on TCP/3000 on the host; the host firewall restricts access to trusted networks. MariaDB port 3306 is not exposed to the network. Host networking is specific to this test-host arrangement, not a universal requirement; any future change must be reflected in Compose and documented.

The test environment's local `.env` uses the following variable names; values stay local and must not be copied into Git or this document:

```env
GRAFANA_ADMIN_USER=...
GRAFANA_ADMIN_PASSWORD=...

GLPI_DB_HOST=127.0.0.1
GLPI_DB_PORT=3306
GLPI_DB_NAME=glpi
GLPI_DB_USER=grafana_reader
GLPI_DB_PASSWORD=...
```

Grafana admin credentials and MariaDB credentials are independent. `GRAFANA_ADMIN_USER` identifies the Grafana application administrator; `GLPI_DB_USER` is the database reader account. Do not reuse either account's credentials for the other.

### Security notes

- Do not add users to the `docker` group without a specific operational need; membership grants elevated privileges, effectively root-level control of the host.
- Do not expose port 3000 publicly without need. Restrict access to the internal network or authorized clients.
- Keep credentials in each environment's untracked `.env`; never put them in Git.

## Development machine: static validation

GitHub Actions runs these static checks on pushes and pull requests: `docker compose config` with values copied from `.env.example`, dashboard JSON parsing, YAML parsing, Markdown lint, read-only SQL inspection, versioned query/dashboard parity, Git whitespace, and checks that `.env` is untracked and `.env.example` exists. It does not start containers, use test-environment secrets, or connect to MySQL/GLPI. Credentials must stay outside Git; `.env` must not be versioned. A dedicated secret-scanning tool may be considered separately in the future.

Validate what does not require the integrated environment:

```sh
docker compose config
node scripts/validate-sql.mjs
```

Also parse changed JSON and YAML files with suitable local parsers and review the change:

```sh
git diff --check
git status --short
git diff
```

Use `.env.example` placeholders locally only as needed to render Compose configuration. Do not commit local `.env`, credentials, or real environment details. Database connectivity is not a prerequisite for these checks. SQL may be added only after the actual GLPI schema and version have been verified and documented; static review cannot establish that a query matches a particular installation.

The SQL validator accepts only read-only statements in `sql/`, rejects `SELECT *`, and compares each dashboard panel's embedded query with the `sql/queries/` file whose two-digit prefix matches the panel ID. These checks do not replace query execution or metric comparison in the test environment.

After review, push the intended commit to GitHub. The tracked deployment inputs are Compose, Grafana provisioning/dashboard files, documentation, and any verified SQL. `.env` stays local.

## Test environment: runtime and integration validation

The deployment path is:

```text
Development Machine
        │
        │ git push
        ▼
      GitHub
        │
        │ CI (static validation)
        ▼
Test Environment
        │
        │ git pull
        ▼
Runtime / integration validation
```

There is no manual transfer of project files between development and test. CI does not access the test environment, MariaDB, or GLPI; it does not run real queries, use environment credentials, or deploy automatically.

After `git pull` and local `.env` configuration, run the Compose commands above. Confirm all of the following in the test environment:

- Grafana starts without provisioning errors.
- The **GLPI MySQL** data source is provisioned and can connect to the external database.
- The **GLPI** dashboard is provisioned and persists as expected.
- Dashboard queries execute and the displayed metrics match the corresponding GLPI views and records.
- Restarting Grafana preserves the expected state.

Runtime checks in the current test environment confirmed Grafana is running, its HTTP service and web interface work on port 3000, provisioning loaded, and the MySQL datasource plugin is available. The provisioned datasource has these non-secret settings:

```text
Datasource: GLPI MySQL
Type: MySQL
Database: glpi
Access: proxy
Database privileges: SELECT only
Connection health: OK
```

The datasource is managed in `grafana/provisioning/datasources/`; `secureJsonData` holds the password. Its environment variables are `GLPI_DB_HOST`, `GLPI_DB_PORT`, `GLPI_DB_NAME`, `GLPI_DB_USER`, and `GLPI_DB_PASSWORD`. The datasource authenticates with the MariaDB account that has `SELECT` permission only. Versioned provisioning is the source of truth for persistent datasource changes. Dashboard files in `grafana/dashboards/` and the provider in `grafana/provisioning/dashboards/` are likewise the source of truth; durable edits must be committed through Git rather than made only in the Grafana UI.

Direct MariaDB authentication and read-only database access were confirmed with the MariaDB client, including successful `SELECT` permission. Credentials and query results are not recorded. The datasource and dashboard remained provisioned after Grafana restarted; the dashboard metrics were subsequently validated against GLPI and direct SQL.

For a repeatable direct connection check, use the following command in the test environment and enter the password interactively:

```bash
mariadb -h 127.0.0.1 -u grafana_reader -p glpi
```

The current metric SQL is versioned in `sql/queries/` and has been compared with the installed GLPI version. For future metrics or deployments to another installation, compare results against GLPI and document status mappings, filters, and limitations. Never change the GLPI database, schema, or application as part of this project.

The test environment does not receive project files manually: changes are pushed to GitHub and reach the host through `git pull`. Its `.env` remains local to that environment.

## Validation status in reports

Reports must separate **Static validation** from **Runtime / integration validation**. Static success on the development machine does not imply the test deployment, database connection, dashboard queries, or metric correctness have been validated. Record the environment, date, commands, outcomes, and unresolved checks for each milestone in [milestones.md](milestones.md).

## Provisioning changes

Provisioned files are mounted read-only. Edit the tracked JSON/YAML and restart Grafana or allow its file watcher to load updates. Export from Grafana only when intentionally updating the versioned dashboard, and remove environment-specific or sensitive values before committing.

## Official references

- [Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- [Install the Docker Compose plugin](https://docs.docker.com/compose/install/linux/)
- [Linux post-installation steps for Docker Engine](https://docs.docker.com/engine/install/linux-postinstall/)
- [Port publishing and mapping](https://docs.docker.com/engine/network/port-publishing/)
