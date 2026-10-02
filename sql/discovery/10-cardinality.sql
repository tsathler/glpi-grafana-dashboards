-- Database Discovery: measure raw relationship cardinality by ticket.
-- Run only after files 04 and 05 confirm the referenced relationship columns exist.
-- User relationship types are reported as stored; their roles must be verified separately.

SELECT tickets_id,
       COUNT(DISTINCT users_id) AS related_users
FROM glpi_tickets_users
GROUP BY tickets_id
ORDER BY related_users DESC, tickets_id
LIMIT 100;

SELECT tickets_id,
       type AS observed_value,
       COUNT(DISTINCT users_id) AS related_users
FROM glpi_tickets_users
GROUP BY tickets_id, type
HAVING COUNT(DISTINCT users_id) > 1
ORDER BY related_users DESC, tickets_id, type
LIMIT 100;

SELECT tickets_id,
       COUNT(DISTINCT groups_id) AS related_groups
FROM glpi_groups_tickets
GROUP BY tickets_id
ORDER BY related_groups DESC, tickets_id
LIMIT 100;

SELECT tickets_id,
       type AS observed_value,
       COUNT(DISTINCT groups_id) AS related_groups
FROM glpi_groups_tickets
GROUP BY tickets_id, type
HAVING COUNT(DISTINCT groups_id) > 1
ORDER BY related_groups DESC, tickets_id, type
LIMIT 100;

-- Estimate row multiplication when raw user and group relationships are joined together.
SELECT users_by_ticket.tickets_id,
       users_by_ticket.user_count,
       groups_by_ticket.group_count,
       users_by_ticket.user_count * groups_by_ticket.group_count AS possible_join_rows
FROM (
    SELECT tickets_id, COUNT(DISTINCT users_id) AS user_count
    FROM glpi_tickets_users
    GROUP BY tickets_id
) AS users_by_ticket
JOIN (
    SELECT tickets_id, COUNT(DISTINCT groups_id) AS group_count
    FROM glpi_groups_tickets
    GROUP BY tickets_id
) AS groups_by_ticket
    ON groups_by_ticket.tickets_id = users_by_ticket.tickets_id
WHERE users_by_ticket.user_count > 1
   OR groups_by_ticket.group_count > 1
ORDER BY possible_join_rows DESC, users_by_ticket.tickets_id
LIMIT 100;

-- Future metrics may need COUNT(DISTINCT ticket_id) or pre-aggregation,
-- depending on the relationships confirmed during discovery.
