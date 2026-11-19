-- Current snapshot: valid tasks not started yet.
-- Status groups (verified in TEST and production): finished = is_finished = 1;
-- not started = A Fazer (TEST) or Não Inicializado (production); paused = name contains 'paus';
-- in progress = any other non-finished state; no state = projectstates_id 0 or missing state.
SELECT COUNT(*) AS value
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
JOIN glpi_projectstates AS ps
     ON ps.id = pt.projectstates_id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
  AND pt.projectstates_id <> 0
  AND ps.is_finished = 0
  AND LOWER(TRIM(ps.name)) IN ('a fazer', 'não inicializado');
