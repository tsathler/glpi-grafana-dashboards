-- Event series follow the selected Grafana time range and adaptive bucket interval.
-- Return one timestamp and one numeric column per series, ordered by time.
SELECT ticket_events.time,
       SUM(CASE WHEN ticket_events.metric = 'Created' THEN ticket_events.value ELSE 0 END) AS Created,
       SUM(CASE WHEN ticket_events.metric = 'Solved' THEN ticket_events.value ELSE 0 END) AS Solved
FROM (
    SELECT $__timeGroupAlias(t.date, '$__interval'),
           COUNT(*) AS value,
           'Created' AS metric
    FROM glpi_tickets AS t
    WHERE t.is_deleted = 0
      AND t.date IS NOT NULL
      AND $__timeFilter(t.date)
    GROUP BY time

    UNION ALL

    SELECT $__timeGroupAlias(t.solvedate, '$__interval'),
           COUNT(*) AS value,
           'Solved' AS metric
    FROM glpi_tickets AS t
    WHERE t.is_deleted = 0
      AND t.solvedate IS NOT NULL
      AND $__timeFilter(t.solvedate)
    GROUP BY time
) AS ticket_events
GROUP BY ticket_events.time
ORDER BY ticket_events.time;
