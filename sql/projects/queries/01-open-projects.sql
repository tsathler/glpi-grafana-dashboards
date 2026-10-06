-- Current snapshot: valid projects whose state is not marked finished.
-- Projects without a state (projectstates_id = 0) are included as not finished.
SELECT COUNT(DISTINCT p.id) AS value
FROM glpi_projects AS p
LEFT JOIN glpi_projectstates AS ps
       ON ps.id = p.projectstates_id
WHERE p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
  AND (
      p.projectstates_id = 0
      OR (ps.id IS NOT NULL AND ps.is_finished = 0)
  );
