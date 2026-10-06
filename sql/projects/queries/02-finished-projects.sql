-- Current snapshot: valid projects whose state is marked finished.
SELECT COUNT(DISTINCT p.id) AS value
FROM glpi_projects AS p
JOIN glpi_projectstates AS ps
     ON ps.id = p.projectstates_id
WHERE p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
  AND ps.is_finished = 1;
