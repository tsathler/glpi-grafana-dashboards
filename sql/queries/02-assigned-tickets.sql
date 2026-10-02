-- Current snapshot: tickets whose confirmed GLPI status is Processing (assigned).
SELECT COUNT(*) AS value
FROM glpi_tickets AS t
WHERE t.status = 2
  AND t.is_deleted = 0;
