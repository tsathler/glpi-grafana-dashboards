-- Tickets closed during the selected Grafana time range.
SELECT COUNT(DISTINCT t.id) AS value
FROM glpi_tickets AS t
WHERE t.is_deleted = 0
  AND t.closedate IS NOT NULL
  AND $__timeFilter(t.closedate);
