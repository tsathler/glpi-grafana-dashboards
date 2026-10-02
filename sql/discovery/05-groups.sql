-- Database Discovery: inspect group-ticket relationships.
-- Run the schema statements first; execute dependent samples only when columns are confirmed.
-- Validate type semantics against the GLPI UI.

DESCRIBE glpi_groups_tickets;

SHOW INDEX FROM glpi_groups_tickets;

DESCRIBE glpi_groups;

SHOW INDEX FROM glpi_groups;

SELECT type AS observed_value,
       COUNT(*) AS relationship_rows,
       COUNT(DISTINCT tickets_id) AS tickets,
       COUNT(DISTINCT groups_id) AS groups_count
FROM glpi_groups_tickets
GROUP BY type
ORDER BY type;

SELECT tickets_id,
       type AS observed_value,
       COUNT(DISTINCT groups_id) AS related_groups
FROM glpi_groups_tickets
GROUP BY tickets_id, type
ORDER BY tickets_id, type
LIMIT 100;

-- Group names may reveal internal organizational information; do not commit raw results.
SELECT g.id AS group_id,
       g.name AS group_name,
       COUNT(DISTINCT gt.tickets_id) AS ticket_count
FROM glpi_groups AS g
JOIN glpi_groups_tickets AS gt ON gt.groups_id = g.id
GROUP BY g.id, g.name
ORDER BY ticket_count DESC
LIMIT 50;
