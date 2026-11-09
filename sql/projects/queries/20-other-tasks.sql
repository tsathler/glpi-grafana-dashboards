-- Current snapshot: valid tasks outside the finished, in-progress, and unstarted groups.
-- Tasks without a state and unmatched states are counted as Other.
SELECT COUNT(*) AS value
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
LEFT JOIN glpi_projectstates AS ps
       ON ps.id = pt.projectstates_id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
  AND COALESCE(ps.is_finished, 0) = 0
  AND (
      pt.projectstates_id = 0
      OR ps.id IS NULL
      OR ps.name IS NULL
      OR LOWER(TRIM(ps.name)) NOT IN (
          'em andamento',
          'a fazer'
      )
  );
