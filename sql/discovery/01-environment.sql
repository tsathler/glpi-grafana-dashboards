-- Database Discovery: environment metadata only.
-- Run with the read-only account against the GLPI database.
-- Record the GLPI application version separately from its UI/About page.

SELECT
    VERSION() AS mariadb_version,
    DATABASE() AS current_database,
    @@character_set_database AS database_charset,
    @@collation_database AS database_collation,
    @@session.time_zone AS session_timezone,
    @@global.time_zone AS global_timezone,
    @@system_time_zone AS system_timezone;

SHOW VARIABLES LIKE 'time_zone';
