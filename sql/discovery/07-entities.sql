-- Database Discovery: inspect entities and ticket associations.
-- Confirm the observed column definitions and relation in the installed schema
-- before running the ticket/entity association queries.

DESCRIBE glpi_entities;

SHOW INDEX FROM glpi_entities;

DESCRIBE glpi_tickets;

SELECT entities_id AS entity_id,
       COUNT(*) AS ticket_count
FROM glpi_tickets
GROUP BY entities_id
ORDER BY ticket_count DESC
LIMIT 100;

-- Entity names can reveal internal organizational information; do not commit raw results.
SELECT e.id AS entity_id,
       e.name AS entity_name,
       COUNT(DISTINCT t.id) AS ticket_count
FROM glpi_entities AS e
LEFT JOIN glpi_tickets AS t ON t.entities_id = e.id
GROUP BY e.id, e.name
ORDER BY ticket_count DESC
LIMIT 100;
