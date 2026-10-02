-- Current open-ticket snapshot with no assigned/technician relation.
-- NOT EXISTS avoids multiplying tickets if multiple user relations are present.
SELECT COUNT(DISTINCT t.id) AS value
FROM glpi_tickets AS t
WHERE t.is_deleted = 0
  AND t.status NOT IN (5, 6)
  AND NOT EXISTS (
      SELECT 1
      FROM glpi_tickets_users AS tu
      WHERE tu.tickets_id = t.id
        AND tu.type = 2
  );
