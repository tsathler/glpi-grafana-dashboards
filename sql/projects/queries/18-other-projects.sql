-- Current snapshot: valid projects outside the finished, in-progress, and unstarted/paused groups.
-- Projects without a state and unmatched states are counted as Other.
SELECT COUNT(DISTINCT p.id) AS value
FROM glpi_projects AS p
LEFT JOIN glpi_projectstates AS ps
       ON ps.id = p.projectstates_id
WHERE p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
  AND COALESCE(ps.is_finished, 0) = 0
  AND (
      p.projectstates_id = 0
      OR ps.id IS NULL
      OR ps.name IS NULL
      OR (
          LOWER(TRIM(ps.name)) NOT IN (
              'em andamento',
              'a fazer'
          )
          AND LOWER(TRIM(ps.name)) NOT LIKE '%paus%'
      )
  );
