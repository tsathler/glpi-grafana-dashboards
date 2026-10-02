-- Resolution compliance for solved tickets with a GLPI-calculated TTR deadline.
-- Uses the stored deadline; SLA calendars are not reconstructed.
SELECT 100.0 * SUM(CASE WHEN t.solvedate <= t.time_to_resolve THEN 1 ELSE 0 END)
       / NULLIF(COUNT(*), 0) AS value
FROM glpi_tickets AS t
WHERE t.is_deleted = 0
  AND t.solvedate IS NOT NULL
  AND t.time_to_resolve IS NOT NULL
  AND t.entities_id IN ($entity)
  AND $__timeFilter(t.solvedate);
