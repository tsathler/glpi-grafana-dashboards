-- Database Discovery: project domains, coverage, and assignment-field usage.
-- Review file 11 first; do not retain raw result sets from the environment.
-- All project metrics below exclude deleted records and templates.

-- State values, completion semantics, and valid project counts (including state 0).
SELECT p.projectstates_id AS project_state_id,
       ps.is_finished,
       COUNT(DISTINCT p.id) AS project_count
FROM glpi_projects AS p
LEFT JOIN glpi_projectstates AS ps
       ON ps.id = p.projectstates_id
WHERE p.is_deleted = 0
  AND p.is_template = 0
GROUP BY p.projectstates_id, ps.is_finished
ORDER BY p.projectstates_id;

-- Distribution by project entity.
SELECT p.entities_id,
       COUNT(DISTINCT p.id) AS project_count
FROM glpi_projects AS p
WHERE p.is_deleted = 0
  AND p.is_template = 0
GROUP BY p.entities_id
ORDER BY project_count DESC, p.entities_id;

-- Distribution by priority.
SELECT p.priority,
       COUNT(DISTINCT p.id) AS project_count
FROM glpi_projects AS p
WHERE p.is_deleted = 0
  AND p.is_template = 0
GROUP BY p.priority
ORDER BY p.priority;

-- Observed project progress values.
SELECT p.percent_done,
       COUNT(DISTINCT p.id) AS project_count
FROM glpi_projects AS p
WHERE p.is_deleted = 0
  AND p.is_template = 0
GROUP BY p.percent_done
ORDER BY p.percent_done;

-- Coverage of planned and actual project dates.
SELECT COUNT(*) AS project_count,
       SUM(p.plan_start_date IS NOT NULL) AS planned_start_count,
       SUM(p.plan_end_date IS NOT NULL) AS planned_end_count,
       SUM(p.real_start_date IS NOT NULL) AS actual_start_count,
       SUM(p.real_end_date IS NOT NULL) AS actual_end_count
FROM glpi_projects AS p
WHERE p.is_deleted = 0
  AND p.is_template = 0;

-- Assignment-field population; field names are reported without resolving personal or group names.
SELECT 'users_id' AS assignment_field,
       SUM(p.users_id IS NOT NULL) AS assigned_project_count
FROM glpi_projects AS p
WHERE p.is_deleted = 0
  AND p.is_template = 0
UNION ALL
SELECT 'users_id_tech',
       SUM(p.users_id_tech IS NOT NULL)
FROM glpi_projects AS p
WHERE p.is_deleted = 0
  AND p.is_template = 0
UNION ALL
SELECT 'groups_id',
       SUM(p.groups_id IS NOT NULL)
FROM glpi_projects AS p
WHERE p.is_deleted = 0
  AND p.is_template = 0
UNION ALL
SELECT 'groups_id_tech',
       SUM(p.groups_id_tech IS NOT NULL)
FROM glpi_projects AS p
WHERE p.is_deleted = 0
  AND p.is_template = 0;

-- Project type usage, including the number of valid projects without a type.
SELECT p.projecttypes_id,
       COUNT(DISTINCT p.id) AS project_count
FROM glpi_projects AS p
WHERE p.is_deleted = 0
  AND p.is_template = 0
GROUP BY p.projecttypes_id
ORDER BY p.projecttypes_id;
