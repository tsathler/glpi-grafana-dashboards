-- Database Discovery: verify valid project-to-task cardinality and future join risks.
-- Project-to-task is one-to-many; aggregate before joining additional one-to-many relations.
-- Exclude deleted records and templates on both sides of the relationship.

-- Valid project totals with and without valid tasks.
SELECT COUNT(*) AS project_count,
       SUM(CASE WHEN task_counts.projects_id IS NULL THEN 1 ELSE 0 END) AS projects_without_tasks,
       SUM(CASE WHEN task_counts.projects_id IS NOT NULL THEN 1 ELSE 0 END) AS projects_with_tasks
FROM glpi_projects AS p
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
    GROUP BY pt.projects_id
) AS task_counts
       ON task_counts.projects_id = p.id
WHERE p.is_deleted = 0
  AND p.is_template = 0;

-- Task cardinality per valid project, including projects without valid tasks.
SELECT p.id AS project_id,
       COUNT(pt.id) AS task_count
FROM glpi_projects AS p
LEFT JOIN glpi_projecttasks AS pt
       ON pt.projects_id = p.id
      AND pt.is_deleted = 0
      AND pt.is_template = 0
WHERE p.is_deleted = 0
  AND p.is_template = 0
GROUP BY p.id
ORDER BY task_count DESC, p.id
LIMIT 100;

-- Distribution of valid projects by number of valid tasks.
SELECT per_project.task_count,
       COUNT(*) AS project_count
FROM (
    SELECT p.id,
           COUNT(pt.id) AS task_count
    FROM glpi_projects AS p
    LEFT JOIN glpi_projecttasks AS pt
           ON pt.projects_id = p.id
          AND pt.is_deleted = 0
          AND pt.is_template = 0
    WHERE p.is_deleted = 0
      AND p.is_template = 0
    GROUP BY p.id
) AS per_project
GROUP BY per_project.task_count
ORDER BY per_project.task_count;

-- Compare valid project rows with valid task rows to make the one-to-many fan-out visible.
SELECT COUNT(DISTINCT p.id) AS distinct_project_count,
       COUNT(pt.id) AS joined_task_rows
FROM glpi_projects AS p
LEFT JOIN glpi_projecttasks AS pt
       ON pt.projects_id = p.id
      AND pt.is_deleted = 0
      AND pt.is_template = 0
WHERE p.is_deleted = 0
  AND p.is_template = 0;

-- Joining task rows to another one-to-many relation can multiply these task rows.
-- Use COUNT(DISTINCT project_id/task_id) or pre-aggregate each relation as appropriate.
