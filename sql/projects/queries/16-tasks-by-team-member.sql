-- Valid tasks counted once per User team member; group memberships are not expanded.
SELECT COALESCE(
           NULLIF(TRIM(CONCAT_WS(' ', NULLIF(TRIM(u.firstname), ''), NULLIF(TRIM(u.realname), ''))), ''),
           CONCAT('Usuário #', team.items_id)
       ) AS member_name,
       COUNT(DISTINCT pt.id) AS task_count
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
JOIN (
    SELECT DISTINCT projecttasks_id, items_id
    FROM glpi_projecttaskteams
    WHERE itemtype = 'User'
) AS team
     ON team.projecttasks_id = pt.id
LEFT JOIN glpi_users AS u
       ON u.id = team.items_id
      AND u.is_deleted = 0
      AND u.is_active = 1
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
GROUP BY team.items_id, u.firstname, u.realname

UNION ALL

SELECT 'Sem usuário na equipe' AS member_name,
       COUNT(DISTINCT pt.id) AS task_count
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p
     ON p.id = pt.projects_id
WHERE pt.is_deleted = 0
  AND pt.is_template = 0
  AND p.is_deleted = 0
  AND p.is_template = 0
  AND p.entities_id IN ($entity)
  AND NOT EXISTS (
      SELECT 1
      FROM glpi_projecttaskteams AS team
      WHERE team.projecttasks_id = pt.id
        AND team.itemtype = 'User'
  )
ORDER BY task_count DESC, member_name;
