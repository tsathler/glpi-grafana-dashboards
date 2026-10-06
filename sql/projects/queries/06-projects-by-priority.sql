-- Distribution of valid projects by stored priority value.
SELECT p.priority,
       COUNT(DISTINCT p.id) AS project_count
FROM glpi_projects AS p
WHERE p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
GROUP BY p.priority
ORDER BY p.priority;
