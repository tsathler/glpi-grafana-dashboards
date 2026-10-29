-- Read-only discovery for project task assignment fields and relationships.
-- Run against the target GLPI database before implementing a user assignment chart.

DESCRIBE glpi_projecttasks;
DESCRIBE glpi_users;

-- Candidate user relationship tables; inspect returned tables with DESCRIBE before querying data.
SHOW TABLES LIKE 'glpi_projecttask%user%';
SHOW TABLES LIKE 'glpi_projecttasks%';

-- Compare candidate fields without returning user names or other personal data.
SELECT 'users_id' AS candidate_field,
       COUNT(*) AS task_count,
       SUM(pt.users_id IS NOT NULL AND pt.users_id <> 0) AS populated_count
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p ON p.id = pt.projects_id
WHERE pt.is_deleted = 0 AND pt.is_template = 0
  AND p.is_deleted = 0 AND p.is_template = 0
UNION ALL
SELECT 'users_id_tech', COUNT(*),
       SUM(pt.users_id_tech IS NOT NULL AND pt.users_id_tech <> 0)
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p ON p.id = pt.projects_id
WHERE pt.is_deleted = 0 AND pt.is_template = 0
  AND p.is_deleted = 0 AND p.is_template = 0;

-- Check whether both candidate fields differ on the same tasks; this reveals field overlap only,
-- not functional meaning. Entity scoping is through the valid parent project.
SELECT COUNT(*) AS valid_task_count,
       SUM(pt.users_id IS NOT NULL AND pt.users_id <> 0) AS users_id_count,
       SUM(pt.users_id_tech IS NOT NULL AND pt.users_id_tech <> 0) AS users_id_tech_count,
       SUM(pt.users_id IS NOT NULL AND pt.users_id <> 0
           AND pt.users_id_tech IS NOT NULL AND pt.users_id_tech <> 0
           AND pt.users_id <> pt.users_id_tech) AS differing_values_count
FROM glpi_projecttasks AS pt
JOIN glpi_projects AS p ON p.id = pt.projects_id
WHERE pt.is_deleted = 0 AND pt.is_template = 0
  AND p.is_deleted = 0 AND p.is_template = 0;

-- After inspecting any relationship table schema, check its task/user pair cardinality
-- and inspect user is_deleted/is_active fields. Do not select personal data for discovery.
