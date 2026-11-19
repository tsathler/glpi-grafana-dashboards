-- Current snapshot: all valid projects in the selected entity scope.
SELECT COUNT(*) AS value
FROM glpi_projects AS p
WHERE p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity);
