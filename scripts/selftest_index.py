"""
APIx Engine Self-Test — proves the SQL index mathematics inside a transaction
that is ALWAYS rolled back. Nothing is persisted; the synthetic rows here are
engine test fixtures only, never displayed as index data.

Checks:
  1. All routes quoted exactly at base_fare_p0  -> APIx = 100.00 exactly.
  2. One route perturbed +10%                   -> APIx = 100 + its normalized
                                                   weight contribution (±0.01).
  3. Missing T+45 window on one route           -> λ-renormalisation keeps that
                                                   route's price unchanged.

Usage: python scripts/selftest_index.py
"""

import sys
from pathlib import Path

import psycopg2
import psycopg2.extras

ROOT = Path(__file__).resolve().parent.parent
WINDOWS = [1, 7, 15, 30, 45]


def load_env(path: Path) -> dict:
    env = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        env[key.strip()] = value.strip()
    return env


def insert_quotes(cur, rows):
    psycopg2.extras.execute_values(
        cur,
        """INSERT INTO raw_airfare_quotes
           (source_portal, airline_name, flight_number, origin_airport,
            destination_airport, route_code, departure_date, lead_time_days,
            base_fare, tax_and_fees, total_fare, is_non_stop)
           VALUES %s""",
        rows,
    )


def main() -> int:
    env = load_env(ROOT / ".env.local")
    conn = psycopg2.connect(
        host=env["SUPABASE_DB_HOST"], port=env["SUPABASE_DB_PORT"],
        dbname=env["SUPABASE_DB_NAME"], user=env["SUPABASE_DB_USER"],
        password=env["SUPABASE_DB_PASSWORD"], connect_timeout=20,
        sslmode="require",
    )
    failures = []
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT CURRENT_DATE")
            (today,) = cur.fetchone()  # DB-side date: views group by DATE(captured_at)

            cur.execute(
                "SELECT route_code, origin_airport, destination_airport, "
                "weight_factor, base_fare_p0 FROM dgca_route_weights ORDER BY route_code"
            )
            routes = cur.fetchall()
            if not routes:
                print("FATAL: dgca_route_weights is empty")
                return 1
            weights = {rc: float(w) for rc, _, _, w, _ in routes}
            baselines = {rc: float(p0) for rc, _, _, _, p0 in routes}
            total_w = sum(weights.values())

            # ---- Check 1: baseline fares -> index must be exactly 100.00 ----
            insert_quotes(cur, [
                ("ENGINE-SELFTEST", "SelfTest", "N/A", o, d, rc, today, w,
                 baselines[rc], 0, baselines[rc], True)
                for rc, o, d, _, _ in routes for w in WINDOWS
            ])
            cur.execute("SELECT apix_index_value, active_routes FROM view_national_apix "
                        "WHERE quote_date = %s", (today,))
            idx, active = cur.fetchone()
            ok = float(idx) == 100.00 and active == len(routes)
            print(f"Check 1  baseline fares        : APIx={idx} routes={active} "
                  f"expected=100.00/{len(routes)} -> {'PASS' if ok else 'FAIL'}")
            if not ok:
                failures.append("check1")

            # ---- Check 2: +10% on DEL-BOM -> weighted contribution above 100 ----
            bump_route = "DEL-BOM"
            bumped = baselines[bump_route] * 1.10
            cur.execute("DELETE FROM raw_airfare_quotes WHERE source_portal = 'ENGINE-SELFTEST' "
                        "AND route_code = %s", (bump_route,))
            insert_quotes(cur, [
                ("ENGINE-SELFTEST", "SelfTest", "N/A", "DEL", "BOM", bump_route, today, w,
                 bumped, 0, bumped, True)
                for w in WINDOWS
            ])
            expected = round(100 + 10 * weights[bump_route] / total_w, 2)
            cur.execute("SELECT apix_index_value FROM view_national_apix "
                        "WHERE quote_date = %s", (today,))
            (idx,) = cur.fetchone()
            ok = abs(float(idx) - expected) < 0.01
            print(f"Check 2  DEL-BOM +10%          : APIx={idx} expected={expected} "
                  f"-> {'PASS' if ok else 'FAIL'}")
            if not ok:
                failures.append("check2")

            # ---- Check 3: drop T+45 for BOM-DEL, uniform fares unchanged ----
            hold_route = "BOM-DEL"
            cur.execute("DELETE FROM raw_airfare_quotes WHERE source_portal = 'ENGINE-SELFTEST' "
                        "AND route_code = %s AND lead_time_days = 45", (hold_route,))
            cur.execute("SELECT weighted_route_price FROM view_route_daily_price "
                        "WHERE quote_date = %s AND route_code = %s", (today, hold_route))
            (price,) = cur.fetchone()
            ok = abs(float(price) - baselines[hold_route]) < 0.01
            print(f"Check 3  BOM-DEL missing T+45  : route price={price} "
                  f"expected={baselines[hold_route]:.2f} (λ renormalised) "
                  f"-> {'PASS' if ok else 'FAIL'}")
            if not ok:
                failures.append("check3")
    finally:
        conn.rollback()  # discard ALL self-test rows, always
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM raw_airfare_quotes")
            (remaining,) = cur.fetchone()
        conn.close()

    print(f"\nRollback verified: raw_airfare_quotes rows remaining = {remaining}")
    if failures:
        print(f"SELF-TEST FAILED: {failures}")
        return 1
    print("ENGINE SELF-TEST PASSED (all checks, nothing persisted)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
