-- Current snapshot: all tickets not logically deleted.
SELECT COUNT(*) AS value
FROM glpi_tickets AS t
WHERE t.is_deleted = 0;
