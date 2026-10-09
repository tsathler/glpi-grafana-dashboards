-- Distribution of valid projects by stored priority value.
SELECT CAST(p.priority AS CHAR) AS priority,
       COUNT(DISTINCT p.id) AS project_count
FROM glpi_projects AS p
WHERE p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
GROUP BY p.priority
ORDER BY p.priority;
