-- Database Discovery: find SLA/TTO/TTR-related schema fields without interpreting them.
-- Inspect returned structures and confirm semantics against the installed GLPI UI.

DESCRIBE glpi_tickets;

SELECT TABLE_NAME AS table_name,
       COLUMN_NAME AS column_name,
       DATA_TYPE AS data_type,
       IS_NULLABLE AS is_nullable
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND (
      COLUMN_NAME IN (
          'time_to_own',
          'time_to_resolve',
          'slas_id_tto',
          'slas_id_ttr'
      )
      OR COLUMN_NAME LIKE '%sla%'
      OR COLUMN_NAME LIKE '%time_to%'
      OR COLUMN_NAME LIKE '%tto%'
      OR COLUMN_NAME LIKE '%ttr%'
  )
ORDER BY TABLE_NAME, ORDINAL_POSITION;

SHOW TABLES LIKE '%sla%';
