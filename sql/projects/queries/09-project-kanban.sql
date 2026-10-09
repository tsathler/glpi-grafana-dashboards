-- Dynamic project states plus an explicit no-state column for the Kanban.
-- Empty states are retained; task counts are pre-aggregated within parent-project entity scope.
SELECT state_list.state_id,
       state_list.state_name,
       p.id AS project_id,
       p.name AS project_name,
       p.priority,
       p.percent_done,
       COALESCE(task_counts.task_count, 0) AS task_count
FROM (
    SELECT ps.id AS state_id,
           ps.name AS state_name,
           0 AS is_no_state
    FROM glpi_projectstates AS ps
    UNION ALL
    SELECT 0 AS state_id,
           'Sem estado' AS state_name,
           1 AS is_no_state
) AS state_list
LEFT JOIN glpi_projects AS p
       ON p.projectstates_id = state_list.state_id
      AND p.is_deleted = 0
      AND p.is_template = 0
      AND p.entities_id IN ($entity)
LEFT JOIN (
    SELECT pt.projects_id,
           COUNT(*) AS task_count
    FROM glpi_projecttasks AS pt
    JOIN glpi_projects AS parent_project
         ON parent_project.id = pt.projects_id
    WHERE pt.is_deleted = 0
      AND pt.is_template = 0
      AND parent_project.is_deleted = 0
      AND parent_project.is_template = 0
      AND parent_project.entities_id IN ($entity)
    GROUP BY pt.projects_id
) AS task_counts
       ON task_counts.projects_id = p.id
ORDER BY state_list.is_no_state, state_list.state_id, p.name, p.id;
