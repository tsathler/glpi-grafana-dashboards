"""Generate a deterministic, entirely fictional GLPI-shaped demo dataset."""

from __future__ import annotations

import argparse
import random
from pathlib import Path


DEFAULT_SEED = 20261002
HISTORY_DAYS = 90
DAY = 24 * 60 * 60
TICKET_COUNT = 5_000
ENTITIES = (
    (1, "Service Desk"),
    (2, "Infrastructure"),
    (3, "Corporate"),
)
STATUS_COUNTS = {
    1: 350,   # New
    2: 900,   # Processing (assigned)
    3: 350,   # Processing (planned)
    4: 550,   # Pending
    5: 1750,  # Solved
    6: 1100,  # Closed
}


def relative_datetime(seconds_ago: int | None) -> str:
    if seconds_ago is None:
        return "NULL"
    return f"DATE_ADD(@demo_now, INTERVAL {-seconds_ago} SECOND)"


def build_ticket(ticket_id: int, status: int, rng: random.Random) -> tuple[str, dict[str, int]]:
    entity_id = rng.randint(1, len(ENTITIES))
    created_age = rng.randint(60 * 60, HISTORY_DAYS * DAY)
    is_deleted = int(rng.random() < 0.025)
    solved_age = None
    deadline_age = None
    within_ttr = False
    late_ttr = False

    if status in (5, 6):
        solve_delay = rng.randint(5 * 60, min(created_age, 10 * DAY))
        solved_age = created_age - solve_delay
        if rng.random() < 0.82:
            if rng.random() < 0.72:
                deadline_age = solved_age - rng.randint(15 * 60, 2 * DAY)
                within_ttr = True
            else:
                deadline_age = created_age - rng.randint(1, solve_delay - 1)
                late_ttr = True
    elif rng.random() < (0.65 if status == 4 else 0.80):
        if rng.random() < 0.55:
            deadline_age = rng.randint(60, created_age - 60)
        else:
            deadline_age = -rng.randint(60 * 60, 7 * DAY)

    assert (solved_age is not None) == (status in (5, 6))
    assert solved_age is None or 0 <= solved_age <= created_age
    assert deadline_age is None or deadline_age <= created_age
    assert not (within_ttr and late_ttr)
    if within_ttr:
        assert solved_age is not None and solved_age >= deadline_age
    if late_ttr:
        assert solved_age is not None and solved_age < deadline_age

    values = (
        ticket_id,
        entity_id,
        relative_datetime(created_age),
        relative_datetime(solved_age),
        status,
        is_deleted,
        relative_datetime(deadline_age),
    )
    row = "(" + ", ".join(map(str, values)) + ")"
    summary = {
        "eligible": int(not is_deleted and solved_age is not None and deadline_age is not None),
        "within": int(not is_deleted and within_ttr),
        "late": int(not is_deleted and late_ttr),
        "overdue": int(
            not is_deleted
            and status in (1, 2, 3)
            and deadline_age is not None
            and deadline_age > 0
        ),
    }
    return row, summary


def generate(seed: int) -> tuple[str, dict[str, int]]:
    rng = random.Random(seed)
    statuses = [status for status, count in STATUS_COUNTS.items() for _ in range(count)]
    assert len(statuses) == TICKET_COUNT
    rng.shuffle(statuses)

    lines = [
        "-- Entirely fictional GLPI-shaped data; no production source was used.",
        f"-- Seed: {seed}; {TICKET_COUNT} tickets; {HISTORY_DAYS} days of relative history.",
        "USE glpi;",
        "SET @demo_now = NOW();",
        "",
        "INSERT INTO glpi_entities (id, completename) VALUES",
        ",\n".join(f"    ({entity_id}, '{name}')" for entity_id, name in ENTITIES) + ";",
        "",
    ]
    rows = []
    totals = {"eligible": 0, "within": 0, "late": 0, "overdue": 0}
    columns = "id, entities_id, date, solvedate, status, is_deleted, time_to_resolve"

    for ticket_id, status in enumerate(statuses, start=1):
        row, summary = build_ticket(ticket_id, status, rng)
        rows.append(row)
        for key, value in summary.items():
            totals[key] += value
        if len(rows) == 250:
            lines.append(f"INSERT INTO glpi_tickets ({columns}) VALUES")
            lines.append(",\n".join("    " + item for item in rows) + ";")
            lines.append("")
            rows.clear()

    assert not rows
    assert totals["eligible"] == totals["within"] + totals["late"]
    assert totals["within"] > 0 and totals["late"] > 0 and totals["overdue"] > 0
    return "\n".join(lines).rstrip() + "\n", totals


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parent / "generated" / "seed.sql",
    )
    args = parser.parse_args()
    sql, totals = generate(args.seed)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(sql.encode("utf-8"))
    print(f"Generated {TICKET_COUNT} fictional tickets with seed {args.seed}: {args.output}")
    print(
        "Eligible for TTR efficiency: {eligible}; within: {within}; late: {late}; "
        "currently overdue: {overdue}".format(**totals)
    )


if __name__ == "__main__":
    main()
