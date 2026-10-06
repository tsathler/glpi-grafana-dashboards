-- Distribution of valid projects by state; state 0 is labeled generically.
SELECT CASE
           WHEN p.projectstates_id = 0 THEN 'Sem estado'
           ELSE ps.name
       END AS state_name,
       COUNT(DISTINCT p.id) AS project_count
FROM glpi_projects AS p
LEFT JOIN glpi_projectstates AS ps
       ON ps.id = p.projectstates_id
WHERE p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
GROUP BY p.projectstates_id, ps.name
ORDER BY (p.projectstates_id = 0), state_name;
