-- Database Discovery: observe stored domain values without assigning meanings.
-- Keep the raw values and counts as test-environment evidence; do not infer labels.

SELECT status AS observed_value, COUNT(*) AS row_count
FROM glpi_tickets
GROUP BY status
ORDER BY status;

SELECT type AS observed_value, COUNT(*) AS row_count
FROM glpi_tickets
GROUP BY type
ORDER BY type;

SELECT priority AS observed_value, COUNT(*) AS row_count
FROM glpi_tickets
GROUP BY priority
ORDER BY priority;

SELECT urgency AS observed_value, COUNT(*) AS row_count
FROM glpi_tickets
GROUP BY urgency
ORDER BY urgency;

SELECT impact AS observed_value, COUNT(*) AS row_count
FROM glpi_tickets
GROUP BY impact
ORDER BY impact;

SELECT is_deleted AS observed_value, COUNT(*) AS row_count
FROM glpi_tickets
GROUP BY is_deleted
ORDER BY is_deleted;
