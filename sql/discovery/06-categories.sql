-- Database Discovery: inspect ITIL categories and ticket associations.
-- Confirm the observed column definitions and relation in the installed schema
-- before running the ticket/category association queries.

DESCRIBE glpi_itilcategories;

SHOW INDEX FROM glpi_itilcategories;

DESCRIBE glpi_tickets;

SELECT itilcategories_id AS category_id,
       COUNT(*) AS ticket_count
FROM glpi_tickets
GROUP BY itilcategories_id
ORDER BY ticket_count DESC
LIMIT 100;

-- Category names can be environment-specific; do not commit raw results.
SELECT c.id AS category_id,
       c.name AS category_name,
       COUNT(DISTINCT t.id) AS ticket_count
FROM glpi_itilcategories AS c
LEFT JOIN glpi_tickets AS t ON t.itilcategories_id = c.id
GROUP BY c.id, c.name
ORDER BY ticket_count DESC
LIMIT 100;
