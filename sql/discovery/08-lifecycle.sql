-- Database Discovery: inspect ticket time and lifecycle columns.
-- The metadata query safely reports which candidate columns exist in this installation.

SELECT COLUMN_NAME AS column_name,
       DATA_TYPE AS data_type,
       IS_NULLABLE AS is_nullable
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'glpi_tickets'
  AND COLUMN_NAME IN (
      'date',
      'date_creation',
      'date_mod',
      'takeintoaccountdate',
      'solvedate',
      'closedate',
      'begin_waiting_date',
      'waiting_duration',
      'sla_waiting_duration'
  )
ORDER BY ORDINAL_POSITION;

-- First review the metadata above. Remove any columns that are absent before running this sample.
-- Compare timestamps for a small set of tickets with the GLPI UI; do not commit raw rows.
SELECT id,
       date,
       date_creation,
       date_mod,
       takeintoaccountdate,
       solvedate,
       closedate,
       begin_waiting_date,
       waiting_duration,
       sla_waiting_duration
FROM glpi_tickets
ORDER BY id DESC
LIMIT 20;
