-- Average stored progress for valid tasks in the configured Em andamento state.
SELECT AVG(pt.percent_done) AS average_progress
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
JOIN glpi_projectstates AS ps
     ON ps.id = pt.projectstates_id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
  AND ps.is_finished = 0
  AND LOWER(TRIM(ps.name)) = 'em andamento';
