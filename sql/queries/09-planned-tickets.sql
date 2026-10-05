-- Current snapshot: tickets whose confirmed GLPI status is Processing (planned).
SELECT COUNT(*) AS value
FROM glpi_tickets AS t
WHERE t.status = 3
  AND t.is_deleted = 0
  AND t.entities_id IN ($entity);
