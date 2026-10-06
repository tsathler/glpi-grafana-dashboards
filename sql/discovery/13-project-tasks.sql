-- Database Discovery: task counts, state/progress values, date coverage, and parent project scope.
-- Review file 11 first; task entity is derived from the parent project.
-- All task metrics below exclude deleted records and templates; parent project scope is applied.

-- Total valid task count belonging to valid parent projects.
SELECT COUNT(*) AS task_count
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0;

-- Task progress values.
SELECT pt.percent_done,
       COUNT(*) AS task_count
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0
GROUP BY pt.percent_done
ORDER BY pt.percent_done;

-- Task state values and completion semantics; meanings require separate verification.
SELECT pt.projectstates_id AS task_state_id,
       ps.is_finished,
       COUNT(*) AS task_count
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
LEFT JOIN glpi_projectstates AS ps
       ON pt.projectstates_id = ps.id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0
GROUP BY pt.projectstates_id, ps.is_finished
ORDER BY pt.projectstates_id;

-- Coverage of planned and actual task dates.
SELECT COUNT(*) AS task_count,
       SUM(pt.plan_start_date IS NOT NULL) AS planned_start_count,
       SUM(pt.plan_end_date IS NOT NULL) AS planned_end_count,
       SUM(pt.real_start_date IS NOT NULL) AS actual_start_count,
       SUM(pt.real_end_date IS NOT NULL) AS actual_end_count
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0;

-- Assignment-field population without resolving user or group names.
SELECT 'users_id' AS assignment_field,
       SUM(pt.users_id IS NOT NULL) AS assigned_task_count
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0
UNION ALL
SELECT 'users_id_tech',
       SUM(pt.users_id_tech IS NOT NULL)
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0
UNION ALL
SELECT 'groups_id',
       SUM(pt.groups_id IS NOT NULL)
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0
UNION ALL
SELECT 'groups_id_tech',
       SUM(pt.groups_id_tech IS NOT NULL)
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0;

-- Milestone usage.
SELECT pt.is_milestone,
       COUNT(*) AS task_count
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0
GROUP BY pt.is_milestone
ORDER BY pt.is_milestone;

-- Task counts by parent project.
SELECT pt.projects_id,
       COUNT(*) AS task_count
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0
GROUP BY pt.projects_id
ORDER BY task_count DESC, pt.projects_id
LIMIT 100;

-- Task counts by the entity of the parent project, not a task entity column.
SELECT p.entities_id,
       COUNT(*) AS task_count,
       COUNT(DISTINCT p.id) AS project_count
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0
GROUP BY p.entities_id
ORDER BY task_count DESC, p.entities_id;
