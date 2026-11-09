-- Average stored progress for valid projects in the configured Em andamento state.
SELECT AVG(p.percent_done) AS average_progress
FROM glpi_projects AS p
JOIN glpi_projectstates AS ps
     ON ps.id = p.projectstates_id
WHERE p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
  AND ps.is_finished = 0
  AND LOWER(TRIM(ps.name)) = 'em andamento';
