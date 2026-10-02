-- Database Discovery: ticket table structure and indexes.
-- Review schema output before relying on optional columns or running the sample below.

DESCRIBE glpi_tickets;

SHOW INDEX FROM glpi_tickets;

-- Run this sample only if DESCRIBE confirms every selected column exists.
-- Limited sample of non-descriptive ticket fields for comparison with GLPI.
-- Treat query output as sensitive and do not commit raw rows.
SELECT
    id,
    status,
    type,
    priority,
    urgency,
    impact,
    is_deleted
FROM glpi_tickets
ORDER BY id DESC
LIMIT 10;
