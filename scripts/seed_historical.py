"""
APIx Phase 1 — Seed historical airfares (Bathwal/EaseMyTrip dataset) into
raw_airfare_quotes per the GATE 1 execution directives.

    python scripts/seed_historical.py --dry-run
    python scripts/seed_historical.py            # full insert + rebase
    python scripts/seed_historical.py --force    # replace existing baseline rows

GATE 1 directives implemented here (each reported in the run output):
  1. class == 'Economy' only.
  2. City -> IATA: Delhi->DEL, Mumbai->BOM, Bangalore->BLR, Kolkata->CCU,
     Chennai->MAA (Hyderabad rows are outside the monitored basket and drop).
  3. days_left -> lead_time_days bins: {1}->{1}, 6..8->{7}, 14..16->{15},
     28..32->{30}, 43..47->{45}; all other observations drop.
  4. Fare decomposition: base_fare = round(price*0.80, 2),
     tax_and_fees = round(price*0.20, 2), total_fare = price.
  5. Synthetic calendar: observations of each (route, window) group are
     spread across 30 consecutive calendar days ending today (IST) via
     stratified randomization: the group is sorted by fare, cut into bands of
     30 consecutive ranks, and each band is dealt to the 30 days under a
     fixed-seed permutation (leftover top ranks -> distinct random days).
     Every day therefore samples every percentile band of the group's price
     distribution — an unbroken 30-day timeline with NO manufactured drift
     (a price-sorted i%30 round-robin slides ~one band over the month and
     fakes ~+5%/month inflation).
  6. base_fare_p0 per route = the route's lambda-weighted composite price
     (view_route_daily_price) on the earliest quote date, so the base period
     reads APIx = 100.00 per PRD Step 3.

Honesty contract: every inserted row traces 1:1 to a CSV row; nothing is
fabricated beyond the directed calendar placement. departure_date is kept
semantically true: quote_date + the row's actual days_left.
"""

import argparse
import random
import re
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import numpy as np
import pandas as pd
import psycopg2
import psycopg2.extras

ROOT = Path(__file__).resolve().parent.parent
SOURCE_PORTAL = "DGCA-Historical"
FARE_FLOOR, FARE_CEILING = 1000, 200000
IST = timezone(timedelta(hours=5, minutes=30))

CITY_TO_IATA = {"Delhi": "DEL", "Mumbai": "BOM", "Bangalore": "BLR",
                "Kolkata": "CCU", "Chennai": "MAA", "Hyderabad": "HYD"}
AIRLINE_NAMES = {"GO_FIRST": "GO First", "Air_India": "Air India",
                 "Indigo": "IndiGo", "AirAsia": "Air Asia",
                 "Vistara": "Vistara", "SpiceJet": "SpiceJet"}
REQUIRED_COLS = {"airline", "flight", "source_city", "destination_city",
                 "class", "days_left", "price"}


def bin_lead_time(days_left: int):
    if days_left == 1:
        return 1
    if 6 <= days_left <= 8:
        return 7
    if 14 <= days_left <= 16:
        return 15
    if 28 <= days_left <= 32:
        return 30
    if 43 <= days_left <= 47:
        return 45
    return None


def load_env(path: Path) -> dict:
    env = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        env[key.strip()] = value.strip()
    return env


def connect(env):
    return psycopg2.connect(
        host=env["SUPABASE_DB_HOST"], port=env["SUPABASE_DB_PORT"],
        dbname=env["SUPABASE_DB_NAME"], user=env["SUPABASE_DB_USER"],
        password=env["SUPABASE_DB_PASSWORD"], connect_timeout=20,
        sslmode="require",
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default="data/historical_flights.csv")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--force", action="store_true",
                    help="replace existing DGCA-Historical rows in the range")
    ap.add_argument("--no-rebase", action="store_true",
                    help="keep SCHEMA.sql base_fare_p0 values")
    ap.add_argument("--span", type=int, default=30,
                    help="calendar timeline length in days (default 30)")
    args = ap.parse_args()

    csv_path = ROOT / args.csv
    if not csv_path.exists():
        raise SystemExit(f"FATAL: CSV not found: {csv_path}")

    df = pd.read_csv(csv_path)
    df = df.drop(columns=[c for c in df.columns if str(c).startswith("Unnamed")])
    missing = REQUIRED_COLS - set(df.columns)
    if missing:
        raise SystemExit(f"FATAL: CSV missing columns {missing}; found {list(df.columns)}")
    print(f"Loaded {csv_path.name}: {len(df):,} rows")

    # 1. Economy only
    eco = df[df["class"] == "Economy"].copy()
    print(f"Filter class == 'Economy'      : {len(eco):,} rows (dropped {len(df)-len(eco):,} Business)")

    # 2. Cities -> IATA, keep monitored basket only (validated against DB)
    eco["route_code"] = (eco["source_city"].map(CITY_TO_IATA)
                         + "-" + eco["destination_city"].map(CITY_TO_IATA))
    env = load_env(ROOT / ".env.local")
    conn = connect(env)
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT route_code FROM dgca_route_weights")
            basket = {rc for (rc,) in cur.fetchall()}
    except Exception:
        conn.close()
        raise
    in_basket = eco[eco["route_code"].isin(basket)].copy()
    print(f"Monitored basket routes        : {len(in_basket):,} rows "
          f"(dropped {len(eco)-len(in_basket):,} off-basket/outside-city rows)")

    # 3. days_left -> window bins
    in_basket["lead_time_days"] = in_basket["days_left"].apply(bin_lead_time)
    binned = in_basket[in_basket["lead_time_days"].notna()].copy()
    binned["lead_time_days"] = binned["lead_time_days"].astype(int)
    print(f"days_left in directed bins     : {len(binned):,} rows "
          f"(dropped {len(in_basket)-len(binned):,} outside the T+1/7/15/30/45 bins)")
    print("  rows per window: " + str(binned["lead_time_days"].value_counts().sort_index().to_dict()))

    # fare sanity
    binned["price"] = pd.to_numeric(binned["price"], errors="coerce")
    bad_fare = binned["price"].isna() | ~binned["price"].between(FARE_FLOOR, FARE_CEILING)
    binned = binned[~bad_fare]
    print(f"Fare within [{FARE_FLOOR:,}, {FARE_CEILING:,}] : {len(binned):,} rows "
          f"(dropped {int(bad_fare.sum())})")

    # dedup: exact identical offerings only (same route/flight/window/fare/timings)
    sig = ["route_code", "flight", "days_left", "price",
           "departure_time", "arrival_time", "duration"]
    before = len(binned)
    binned = binned.drop_duplicates(subset=sig)
    print(f"Exact-duplicate offerings      : dropped {before - len(binned):,} -> {len(binned):,} rows")

    # 4. fare decomposition (directed 80/20 split)
    binned["base_fare"] = (binned["price"] * 0.80).round(2)
    binned["tax_and_fees"] = (binned["price"] * 0.20).round(2)
    binned["total_fare"] = binned["price"].round(2)

    # 5. synthetic calendar: stratified randomization across `span` days
    today_ist = datetime.now(IST).date()
    start_date = today_ist - timedelta(days=args.span - 1)
    binned = binned.sort_values(["route_code", "lead_time_days", "price", "flight"],
                                kind="stable").reset_index(drop=True)
    rng = np.random.default_rng(20260918)  # fixed seed -> deterministic, reproducible seeding
    span = args.span
    offsets = np.empty(len(binned), dtype=np.int64)
    for indices in binned.groupby(["route_code", "lead_time_days"], sort=False).indices.values():
        size = len(indices)
        n_full = size // span
        leftover = size - n_full * span
        day = np.empty(size, dtype=np.int64)
        # Each full band of 30 consecutive price ranks is spread over ALL days
        # via a random permutation -> every day samples every percentile band
        # exactly once (no slide, no starvation). The leftover top ranks go to
        # DISTINCT random days (consecutive days would fake a drift).
        for k in range(n_full):
            day[k * span:(k + 1) * span] = rng.permutation(span)
        if leftover:
            day[n_full * span:] = rng.permutation(span)[:leftover]
        offsets[indices] = day
    binned["quote_date"] = [start_date + timedelta(days=int(o)) for o in offsets]
    binned["departure_date"] = [qd + timedelta(days=int(dl)) for qd, dl in
                                zip(binned["quote_date"], binned["days_left"])]
    print(f"Calendar timeline              : {start_date} .. {today_ist} "
          f"({args.span} days, round-robin within each route x window group)")

    binned["airline_name"] = binned["airline"].map(AIRLINE_NAMES).fillna(binned["airline"])
    binned["flight_number"] = binned["flight"].astype(str).str.slice(0, 20)
    binned["is_non_stop"] = binned["stops"].eq("zero") if "stops" in binned else True
    binned["captured_at"] = [datetime(qd.year, qd.month, qd.day, 0, 30, tzinfo=timezone.utc)
                             for qd in binned["quote_date"]]  # 06:00 IST, keeps UTC date == quote_date

    rows = [
        (SOURCE_PORTAL, r.airline_name, r.flight_number,
         r.route_code.split("-")[0], r.route_code.split("-")[1], r.route_code,
         r.departure_date, r.lead_time_days,
         float(r.base_fare), float(r.tax_and_fees), float(r.total_fare),
         bool(r.is_non_stop), r.captured_at)
        for r in binned.itertuples(index=False)
    ]
    drange = (binned["quote_date"].min(), binned["quote_date"].max())
    print(f"\nRows to insert                 : {len(rows):,}")
    print(f"Fare range                     : {binned['total_fare'].min():,.0f} .. "
          f"{binned['total_fare'].max():,.0f}")
    print("Rows per route: " + str(binned["route_code"].value_counts().sort_index().to_dict()))
    print("\nSample mapped rows (up to 5):")
    for r in rows[:5]:
        print(f"  {r[5]} quote={r[12].date()} dep={r[6]} T+{r[7]} {r[1]:<10} "
              f"fare={r[10]:,.0f} base={r[8]:,.0f} tax={r[9]:,.0f}")

    if args.dry_run:
        print("\nDRY RUN — nothing written.")
        conn.close()
        return 0
    if not rows:
        print("FATAL: nothing to insert.")
        conn.close()
        return 1

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM raw_airfare_quotes WHERE source_portal = %s "
                        "AND DATE(captured_at) BETWEEN %s AND %s",
                        (SOURCE_PORTAL, drange[0], drange[1]))
            (existing,) = cur.fetchone()
            if existing:
                if not args.force:
                    raise SystemExit(
                        f"FATAL: {existing} DGCA-Historical rows already exist in {drange[0]}..{drange[1]}. "
                        f"Re-run with --force to replace them.")
                cur.execute("DELETE FROM raw_airfare_quotes WHERE source_portal = %s "
                            "AND DATE(captured_at) BETWEEN %s AND %s",
                            (SOURCE_PORTAL, drange[0], drange[1]))
                print(f"\nReplaced {existing} existing DGCA-Historical rows (--force).")

            psycopg2.extras.execute_values(cur, """
                INSERT INTO raw_airfare_quotes
                (source_portal, airline_name, flight_number, origin_airport,
                 destination_airport, route_code, departure_date, lead_time_days,
                 base_fare, tax_and_fees, total_fare, is_non_stop, captured_at)
                VALUES %s""", rows, page_size=1000)
            print(f"\nInserted {len(rows):,} rows into raw_airfare_quotes.")

            # 6. rebase P(r,0) to the earliest date's lambda-weighted route price
            if not args.no_rebase:
                cur.execute("""
                    WITH base AS (
                        SELECT route_code, MIN(quote_date) AS base_date
                        FROM view_route_daily_price GROUP BY route_code
                    )
                    UPDATE dgca_route_weights w
                       SET base_fare_p0 = v.weighted_route_price,
                           updated_at   = CURRENT_TIMESTAMP
                      FROM view_route_daily_price v
                      JOIN base b ON v.route_code = b.route_code
                                 AND v.quote_date = b.base_date
                     WHERE w.route_code = v.route_code
                    RETURNING w.route_code, w.base_fare_p0
                """)
                rebased = dict(cur.fetchall())
                print(f"\nRebase base_fare_p0 = earliest-date route composite "
                      f"({drange[0]}) for {len(rebased)} routes:")
                for rc, p0 in sorted(rebased.items()):
                    print(f"  {rc}: P0 = {p0}")
        conn.commit()

        # ---- GATE 2 verification ----
        with conn.cursor() as cur:
            print("\n=== GATE 2: view_national_apix ===")
            cur.execute("SELECT quote_date, apix_index_value, active_routes "
                        "FROM view_national_apix LIMIT 5")
            print("First 5 records (newest first):")
            for qd, idx, active in cur.fetchall():
                print(f"  {qd}  APIx={idx:>8}  active_routes={active}")
            cur.execute("SELECT MIN(apix_index_value), MAX(apix_index_value), "
                        "ROUND(AVG(apix_index_value), 2), COUNT(*) FROM view_national_apix")
            mn, mx, avg, n = cur.fetchone()
            print(f"30-day trajectory: min={mn} max={mx} mean={avg} days={n}")
            cur.execute("SELECT COUNT(DISTINCT quote_date), MIN(quote_date), MAX(quote_date) "
                        "FROM view_route_daily_price")
            days, lo, hi = cur.fetchone()
            print(f"Route price coverage: {days} distinct dates, {lo} .. {hi} (unbroken={days == args.span})")
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
