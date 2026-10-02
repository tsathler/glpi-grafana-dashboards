# Development and deployment

## Environment separation

The development machine prepares and validates repository files. It is not assumed to have access to the GLPI database or the integrated test environment. Development and test each keep a separate local `.env`, created from `.env.example`; `.env` is not versioned, and credentials must never be copied through Git or written into documentation.

The test environment receives changes through Git. This repository deploys Grafana only; the GLPI database remains external, and Grafana must use a read-only database account.

## Test environment setup

### Prerequisites

The test environment currently used by this project is **Ubuntu Server 24.04 LTS**, with Git, Docker Engine, and the Docker Compose plugin. Other Linux distributions may work, but Ubuntu Server 24.04 LTS is the environment documented here.

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

This usually means Docker's official repository was not configured or APT has not loaded it. Refresh package metadata:

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

If Compose publishes the port as:

```yaml
ports:
  - "3000:3000"
```

open `http://IP_DO_SERVIDOR:3000` from a machine with network access to the test server. Replace the placeholder with the server address locally; do not record a real environment IP in the repository.

### Security notes

- Do not add users to the `docker` group without a specific operational need; membership grants elevated privileges, effectively root-level control of the host.
- Do not expose port 3000 publicly without need. Restrict access to the internal network or authorized clients.
- Keep credentials in each environment's untracked `.env`; never put them in Git.

## Development machine: static validation

GitHub Actions runs these static checks on pushes and pull requests: `docker compose config` with values copied from `.env.example`, dashboard JSON parsing, YAML parsing, Markdown lint, Git whitespace, and checks that `.env` is untracked and `.env.example` exists. It does not start containers, use test-environment secrets, or connect to MySQL/GLPI. Credentials must stay outside Git; `.env` must not be versioned. A dedicated secret-scanning tool may be considered separately in the future.

Validate what does not require the integrated environment:

```sh
docker compose config
```

Also parse changed JSON and YAML files with suitable local parsers and review the change:

```sh
git diff --check
git status --short
git diff
```

Use `.env.example` placeholders locally only as needed to render Compose configuration. Do not commit local `.env`, credentials, or real environment details. Database connectivity is not a prerequisite for these checks. SQL may be added only after the actual GLPI schema and version have been verified and documented; static review cannot establish that a query matches a particular installation.

After review, push the intended commit to GitHub. The tracked deployment inputs are Compose, Grafana provisioning/dashboard files, documentation, and any verified SQL. `.env` stays local.

## Test environment: runtime and integration validation

After `git pull` and local `.env` configuration, run the Compose commands above. Confirm all of the following in the test environment:

- Grafana starts without provisioning errors.
- The **GLPI MySQL** data source is provisioned and can connect to the external database.
- The **GLPI** dashboard is provisioned and persists as expected.
- Dashboard queries execute and the displayed metrics match the corresponding GLPI views and records.
- Restarting Grafana preserves the expected state.

If there is no verified metric SQL yet, record query execution and metric comparison as pending; do not imply they passed. Compare metrics against GLPI using the actual installed version and document status mappings, filters, and limitations. Never change the GLPI database, schema, or application as part of this project.

## Validation status in reports

Reports must separate **Static validation** from **Runtime / integration validation**. Static success on the development machine does not imply the test deployment, database connection, dashboard queries, or metric correctness have been validated. Record the environment, date, commands, outcomes, and unresolved checks for each milestone in [milestones.md](milestones.md).

## Provisioning changes

Provisioned files are mounted read-only. Edit the tracked JSON/YAML and restart Grafana or allow its file watcher to load updates. Export from Grafana only when intentionally updating the versioned dashboard, and remove environment-specific or sensitive values before committing.

## Official references

- [Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- [Install the Docker Compose plugin](https://docs.docker.com/compose/install/linux/)
- [Linux post-installation steps for Docker Engine](https://docs.docker.com/engine/install/linux-postinstall/)
- [Port publishing and mapping](https://docs.docker.com/engine/network/port-publishing/)
