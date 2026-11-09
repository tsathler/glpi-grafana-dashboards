-- Current snapshot: valid projects in A Fazer or a paused state.
-- State 0 is intentionally excluded; it represents no state and is counted as Other.
SELECT COUNT(DISTINCT p.id) AS value
FROM glpi_projects AS p
JOIN glpi_projectstates AS ps
     ON ps.id = p.projectstates_id
WHERE p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
  AND ps.is_finished = 0
  AND (
      LOWER(TRIM(ps.name)) = 'a fazer'
      OR LOWER(TRIM(ps.name)) LIKE '%paus%'
  );
