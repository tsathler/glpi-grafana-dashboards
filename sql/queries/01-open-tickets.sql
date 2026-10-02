-- Current snapshot: intentionally independent of the Grafana time picker.
SELECT COUNT(DISTINCT t.id) AS value
FROM glpi_tickets AS t
WHERE t.is_deleted = 0
  AND t.status NOT IN (5, 6);
