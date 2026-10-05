import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const schema = readFileSync(join(root, 'demo', 'schema.sql'), 'utf8');
const grants = readFileSync(join(root, 'demo', 'grants.sql'), 'utf8');
const seedPath = process.argv[2] ?? join(root, 'demo', 'generated', 'seed.sql');
const seed = readFileSync(seedPath, 'utf8');

function columns(table) {
  const definition = schema.match(new RegExp(`CREATE TABLE ${table} \\(([\\s\\S]*?)\\) ENGINE=`, 'i'));
  assert.ok(definition, `Demo table ${table} is missing`);
  return [...definition[1].matchAll(/^\s*([a-z_]+)\s+(?:INT|TINYINT|DATETIME|VARCHAR)\b/gim)]
    .map((match) => match[1]);
}

const ticketColumns = columns('glpi_tickets');
const entityColumns = columns('glpi_entities');
assert.deepEqual(ticketColumns.sort(), [
  'id', 'entities_id', 'date', 'solvedate', 'status', 'is_deleted', 'time_to_resolve',
].sort());
assert.deepEqual(entityColumns.sort(), ['id', 'completename'].sort());

for (const file of readdirSync(join(root, 'sql', 'queries')).filter((name) => name.endsWith('.sql'))) {
  const sql = readFileSync(join(root, 'sql', 'queries', file), 'utf8');
  for (const [, column] of sql.matchAll(/\bt\.([a-z_][a-z_0-9]*)/gi)) {
    assert.ok(ticketColumns.includes(column), `${file} references missing demo column t.${column}`);
  }
}

const dashboard = JSON.parse(readFileSync(join(root, 'grafana', 'dashboards', 'glpi-service-desk.json'), 'utf8'));
const entityQuery = dashboard.templating.list.find((variable) => variable.name === 'entity')?.query;
assert.match(entityQuery, /\bglpi_entities\b/);
assert.match(entityQuery, /\bcompletename\s+AS\s+__text\b/i);
assert.match(entityQuery, /\bid\s+AS\s+__value\b/i);
assert.match(grants, /REVOKE ALL PRIVILEGES ON glpi\.\* FROM 'demo_reader'@'%'/);
assert.match(grants, /GRANT SELECT ON glpi\.\* TO 'demo_reader'@'%'/);
assert.match(seed, /SET @demo_now = NOW\(\);/);

const rowPattern = /^    \((\d+), ([123]), DATE_ADD\(@demo_now, INTERVAL (-?\d+) SECOND\), (NULL|DATE_ADD\(@demo_now, INTERVAL (-?\d+) SECOND\)), ([1-6]), ([01]), (NULL|DATE_ADD\(@demo_now, INTERVAL (-?\d+) SECOND\))\)([,;])$/gm;
const ticketRows = [...seed.matchAll(rowPattern)];
assert.equal(ticketRows.length, 5_000, 'Demo seed must contain 5,000 valid ticket rows');
assert.equal((seed.match(/INSERT INTO glpi_tickets \(/g) ?? []).length, 20);
const statusCounts = new Map();
let withinTtr = 0;
let outsideTtr = 0;
let overdue = 0;
for (const [index, match] of ticketRows.entries()) {
  const [, id, , createdOffset, solvedExpression, solvedOffset, status, deleted, deadlineExpression, deadlineOffset] = match;
  assert.equal(Number(id), index + 1);
  if (deleted === '0') statusCounts.set(Number(status), (statusCounts.get(Number(status)) ?? 0) + 1);
  const solved = solvedExpression === 'NULL' ? null : Number(solvedOffset);
  const deadline = deadlineExpression === 'NULL' ? null : Number(deadlineOffset);
  assert.equal(solved !== null, status === '5' || status === '6');
  assert.ok(solved === null || solved >= Number(createdOffset), `Ticket ${id}: solved before creation`);
  assert.ok(deadline === null || deadline >= Number(createdOffset), `Ticket ${id}: deadline before creation`);
  if (deleted === '0' && solved !== null && deadline !== null) {
    if (solved <= deadline) withinTtr += 1;
    else outsideTtr += 1;
  }
  if (deleted === '0' && ['1', '2', '3'].includes(status) && solved === null && deadline !== null && deadline < 0) {
    overdue += 1;
  }
}
assert.deepEqual([...statusCounts.keys()].sort(), [1, 2, 3, 4, 5, 6]);
for (const count of statusCounts.values()) assert.ok(count >= 100);
assert.ok(withinTtr >= 100 && outsideTtr >= 100 && overdue >= 100);
for (const name of ['Service Desk', 'Infrastructure', 'Corporate']) {
  assert.ok(seed.includes(`'${name}'`), `Fictional entity ${name} is missing`);
}

console.log('OK: minimal demo schema, 5,000 coherent synthetic rows, status/TTR coverage, and reader grants');
