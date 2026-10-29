-- Operational project table with valid task counts pre-aggregated per project.
SELECT p.id AS project_id,
       p.name AS project_name,
       CASE
           WHEN p.projectstates_id = 0 THEN 'Sem estado'
           ELSE ps.name
       END AS state_name,
       p.priority,
       p.percent_done,
       COALESCE(task_counts.task_count, 0) AS task_count
FROM glpi_projects AS p
LEFT JOIN glpi_projectstates AS ps
       ON ps.id = p.projectstates_id
LEFT JOIN (
    SELECT pt.projects_id,
           COUNT(*) AS task_count
    FROM glpi_projecttasks AS pt
    WHERE pt.is_deleted = 0
      AND pt.is_template = 0
    GROUP BY pt.projects_id
) AS task_counts
       ON task_counts.projects_id = p.id
WHERE p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
ORDER BY p.name, p.id;
