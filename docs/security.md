# Security

- Configure a dedicated database account such as `grafana_reader`, with `SELECT` only on the required GLPI database. Do not use root, an administrator, or the GLPI application's account.
- Keep `.env` untracked. Replace all example passwords before starting and use unique, strong secrets. Do not store credentials in dashboards or source control.
- Restrict database network access to the Grafana host or its trusted network using firewall rules. Do not expose the database publicly.
- Port 3000 is published by Compose. Restrict access to Grafana at the host/network boundary; use an appropriate TLS-enabled reverse proxy when exposing it beyond a trusted local network.
- Change the initial Grafana admin password and protect the admin account. User sign-up is disabled.
- Ticket data can contain personal or confidential information. Limit dashboard access and avoid publishing real ticket data, usernames, entity names, or internal host details.
- Example addresses and credentials in this repository are placeholders only.
