-- Current snapshot: open tickets past the GLPI-calculated TTR deadline.
-- A missing deadline is not counted as overdue; no SLA deadline is reconstructed here.
SELECT COUNT(*) AS value
FROM glpi_tickets AS t
WHERE t.is_deleted = 0
  AND t.status NOT IN (4, 5, 6)
  AND t.time_to_resolve IS NOT NULL
  AND t.solvedate IS NULL
  AND t.entities_id IN ($entity)
  AND t.time_to_resolve < NOW();
