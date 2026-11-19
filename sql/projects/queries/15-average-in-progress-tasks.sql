-- Average stored progress (percent_done) of valid tasks in progress.
-- Status groups (verified in TEST and production): finished = is_finished = 1;
-- not started = A Fazer (TEST) or Não Inicializado (production); paused = name contains 'paus';
-- in progress = any other non-finished state; no state = projectstates_id 0 or missing state.
SELECT AVG(pt.percent_done) AS average_progress
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
  AND COALESCE(LOWER(TRIM(ps.name)), '') NOT IN ('a fazer', 'não inicializado')
  AND COALESCE(LOWER(TRIM(ps.name)), '') NOT LIKE '%paus%';
