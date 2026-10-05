-- The official image initially grants MARIADB_USER full access to MARIADB_DATABASE.
-- Restrict the dedicated Grafana demo user after loading the synthetic data.
REVOKE ALL PRIVILEGES ON glpi.* FROM 'demo_reader'@'%';
GRANT SELECT ON glpi.* TO 'demo_reader'@'%';
