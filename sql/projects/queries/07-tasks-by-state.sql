-- Distribution of valid tasks by state, scoped through the parent project entity.
SELECT CASE
           WHEN pt.projectstates_id = 0 THEN 'Sem estado'
           ELSE ps.name
       END AS state_name,
       COUNT(DISTINCT pt.id) AS task_count
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
LEFT JOIN glpi_projectstates AS ps
       ON pt.projectstates_id = ps.id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
GROUP BY pt.projectstates_id, ps.name
ORDER BY (pt.projectstates_id = 0), state_name;
