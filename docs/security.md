# Security

- The current test host keeps MariaDB bound to `127.0.0.1:3306`; it is not exposed on the network. Grafana uses host networking in this same-host setup to connect locally. Do not expose MariaDB without a documented need.
- MariaDB access for Grafana uses the dedicated `grafana_reader@localhost` account with only `SELECT` on `glpi.*`. It must not have `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER`, or `DROP` privileges. The connection was validated directly and through the provisioned **GLPI MySQL** datasource.
- With the current host networking configuration, Grafana listens on port 3000 on the test host. Restrict access at the host/network boundary; use an appropriate TLS-enabled reverse proxy when exposing it beyond a trusted local network.
- Change the initial Grafana admin password and protect the admin account. User sign-up is disabled.
- Ticket data can contain personal or confidential information. Limit dashboard access and avoid publishing real ticket data, usernames, entity names, or internal host details.
- The database account follows least privilege: read-only access only. The firewall restricts Grafana's port 3000 to trusted networks; port 3306 is not exposed for application access.

## Secret management

- Never commit `.env`. Each environment keeps its own local configuration; `.env.example` contains placeholders only.
- Keep Grafana administrator and MariaDB credentials independent. Never reuse the Grafana admin account as the database account or vice versa.
- The versioned datasource configuration uses `secureJsonData` for its password. Do not put credentials in dashboards, logs, documentation, or Git.
- GitHub Actions CI requires no secrets. It uses placeholder configuration for static checks and does not connect to test services or deploy.
- Rotate any credential suspected or confirmed to have been exposed. Removing a value from the current file does not remove it from Git history; treat committed credentials as compromised and rotate them. Historical cleanup requires a separate, controlled history-rewrite task.

## Repository review

The current review scanned the working tree and all reachable Git commits for credential patterns, private keys, common token formats, authorization/cookie headers, private network addresses, common internal hostname suffixes, and sensitive artifact filenames. It found no tracked credentials, private keys, matching secret patterns, private network addresses, internal hostname matches, or sensitive artifact files. A local `.env` file exists in the working tree and is ignored by Git; it was not displayed or added. These checks reduce risk but cannot prove that every possible secret format is absent.
