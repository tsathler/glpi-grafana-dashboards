-- Current snapshot: valid tasks whose state is not marked finished, including tasks with no state.
SELECT COUNT(*) AS value
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
LEFT JOIN glpi_projectstates AS ps
       ON ps.id = pt.projectstates_id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
  AND COALESCE(ps.is_finished, 0) = 0;
