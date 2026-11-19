-- Current snapshot: all tickets not logically deleted.
-- Formatted in SQL (60,900) so the thousands separator does not depend on the browser locale.
SELECT FORMAT(COUNT(*), 0) AS value
FROM glpi_tickets AS t
WHERE t.is_deleted = 0
  AND t.entities_id IN ($entity);
