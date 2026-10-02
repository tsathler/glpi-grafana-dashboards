-- Current snapshot: intentionally independent of the Grafana time picker.
SELECT COUNT(*) AS value
FROM glpi_tickets AS t
WHERE t.is_deleted = 0
  AND t.status = 4
  AND t.entities_id IN ($entity);
