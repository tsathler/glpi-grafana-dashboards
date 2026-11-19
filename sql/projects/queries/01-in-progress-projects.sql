-- Current snapshot: valid projects in progress, including intermediate phases.
-- Status groups (verified in TEST and production): finished = is_finished = 1;
-- not started = A Fazer (TEST) or Não Inicializado (production); paused = name contains 'paus';
-- in progress = any other non-finished state; no state = projectstates_id 0 or missing state.
SELECT COUNT(*) AS value
FROM glpi_projects AS p
JOIN glpi_projectstates AS ps
     ON ps.id = p.projectstates_id
WHERE p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
  AND p.projectstates_id <> 0
  AND ps.is_finished = 0
  AND COALESCE(LOWER(TRIM(ps.name)), '') NOT IN ('a fazer', 'não inicializado')
  AND COALESCE(LOWER(TRIM(ps.name)), '') NOT LIKE '%paus%';
