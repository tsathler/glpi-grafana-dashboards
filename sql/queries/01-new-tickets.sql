-- Current snapshot: tickets whose confirmed GLPI status is New.
SELECT COUNT(*) AS value
FROM glpi_tickets AS t
WHERE t.status = 1
  AND t.is_deleted = 0;
