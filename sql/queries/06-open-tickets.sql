-- Current snapshot: open tickets (New, Processing assigned/planned, Pending), not logically deleted.
-- Formatted in SQL (1,234) so the thousands separator does not depend on the browser locale.
SELECT FORMAT(COUNT(*), 0) AS value
FROM glpi_tickets AS t
WHERE t.is_deleted = 0
  AND t.status IN (1, 2, 3, 4)
  AND t.entities_id IN ($entity);
