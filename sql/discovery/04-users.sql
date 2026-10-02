-- Database Discovery: inspect user-ticket relationships.
-- Run the schema statements first; execute dependent samples only when columns are confirmed.
-- Validate each stored type against the GLPI UI before assigning roles.

DESCRIBE glpi_tickets_users;

SHOW INDEX FROM glpi_tickets_users;

DESCRIBE glpi_users;

SHOW INDEX FROM glpi_users;

SELECT type AS observed_value,
       COUNT(*) AS relationship_rows,
       COUNT(DISTINCT tickets_id) AS tickets,
       COUNT(DISTINCT users_id) AS users
FROM glpi_tickets_users
GROUP BY type
ORDER BY type;

SELECT tickets_id,
       type AS observed_value,
       COUNT(DISTINCT users_id) AS related_users
FROM glpi_tickets_users
GROUP BY tickets_id, type
ORDER BY tickets_id, type
LIMIT 100;

-- Limited relation sample; use authorized access and do not commit raw rows.
SELECT tickets_id, users_id, type
FROM glpi_tickets_users
ORDER BY tickets_id DESC
LIMIT 50;
