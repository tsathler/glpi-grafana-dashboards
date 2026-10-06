-- Average stored progress for valid projects; this is not a completion rate.
SELECT AVG(p.percent_done) AS average_progress
FROM glpi_projects AS p
WHERE p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity);
