"""
APIx Phase 3 — Live Google Flights ingestion worker (10 DGCA Corridors).

    python worker/scraper.py                             # default DEL-BOM primary corridor
    python worker/scraper.py --all-routes                # scrape all 10 DGCA corridors
    python worker/scraper.py --routes DEL-BOM,BLR-DEL   # subset of corridors
    python worker/scraper.py --dry-run                   # scrape + print, no DB write
    python worker/scraper.py --horizons 1,7              # subset of horizons
    python worker/scraper.py --headed                    # visible browser (debugging)
    python worker/scraper.py --debug                     # dump result-page HTML per horizon

Per Phase 3 & 4 directives:
  - Google Flights one-way search URLs, curr=INR, hl=en.
  - 10 DGCA Corridors: DEL-BOM, BOM-DEL, BLR-DEL, DEL-BLR, BOM-BLR, BLR-BOM, DEL-CCU, CCU-DEL, MAA-DEL, DEL-MAA.
  - Horizons T+1, T+7, T+15, T+30, T+45 from today (IST).
  - Top 3 competitive carrier quotes per horizon (cheapest quote per distinct airline, ranked by fare).
  - Statutory domestic economy tax decomposition:
      FIXED_AIRPORT_FEE = ₹350.00 (Weighted metro UDF + civil aviation security PSF)
      taxable_fare = max(0.0, total_fare - FIXED_AIRPORT_FEE)
      base_fare = round(taxable_fare / 1.05, 2)
      gst_tax = round(base_fare * 0.05, 2)
      tax_and_fees = round(FIXED_AIRPORT_FEE + gst_tax, 2)
  - Network resilience: Isolated corridor try/except blocks + delay jitter (2-4s).
  - Inserted into raw_airfare_quotes with source_portal = 'GoogleFlights-Live'
    and captured_at = scrape time (UTC).
"""

import argparse
import asyncio
import random
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import psycopg2
import psycopg2.extras

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from seed_historical import IST, connect, load_env  # noqa: E402  (shared helpers)

SOURCE_PORTAL = "GoogleFlights-Live"
HORIZONS = [1, 7, 15, 30, 45]
FARE_FLOOR, FARE_CEILING = 1000, 200000

FIXED_AIRPORT_FEE = 350.00  # Statutory weighted metro UDF + PSF

DGCA_CORRIDORS = {
    "DEL-BOM": ("DEL", "BOM"),
    "BOM-DEL": ("BOM", "DEL"),
    "BLR-DEL": ("BLR", "DEL"),
    "DEL-BLR": ("DEL", "BLR"),
    "BOM-BLR": ("BOM", "BLR"),
    "BLR-BOM": ("BLR", "BOM"),
    "DEL-CCU": ("DEL", "CCU"),
    "CCU-DEL": ("CCU", "DEL"),
    "MAA-DEL": ("MAA", "DEL"),
    "DEL-MAA": ("DEL", "MAA"),
}

SEARCH_URL = ("https://www.google.com/travel/flights?q=Flights%20to%20{dest}%20from%20{orig}"
              "%20on%20{date}%20oneway&curr=INR&hl=en")
RESULT_WAIT_SELECTOR = '[aria-label*="flight with"], a[aria-label*="rupees"], [role="listitem"]'

JS_COLLECT_CARDS = """
() => {
  // Full result cards carry "From X Indian rupees. <stops> flight with <airline>. ..."
  const cards = Array.from(
    document.querySelectorAll('[aria-label*="flight with"]')
  ).map(el => ({
    label: el.getAttribute('aria-label') || '',
    text: (el.innerText || '').replace(/\\s+/g, ' ').slice(0, 500),
  }));
  const seen = new Set();
  const unique = cards.filter(c => {
    if (seen.has(c.label)) return false;
    seen.add(c.label);
    return true;
  });
  if (unique.some(c => /rupees/.test(c.label))) return unique;
  // Fallbacks: listitem roles or any element labelled with a rupee amount
  const fallback = Array.from(
    document.querySelectorAll('[role="listitem"], [aria-label*="rupees"]')
  ).map(el => ({
    label: el.getAttribute('aria-label') || '',
    text: (el.innerText || '').replace(/\\s+/g, ' ').slice(0, 500),
  }));
  return fallback;
}
"""


def decompose_fare(total_fare: float) -> tuple[float, float]:
    """Statutory Indian domestic economy model: Flat airport fee (UDF/PSF) + 5% GST on base fare."""
    taxable_fare = max(0.0, total_fare - FIXED_AIRPORT_FEE)
    base_fare = round(taxable_fare / 1.05, 2)
    gst_tax = round(base_fare * 0.05, 2)
    tax_and_fees = round(FIXED_AIRPORT_FEE + gst_tax, 2)
    return base_fare, tax_and_fees


def parse_quote(card: dict) -> dict | None:
    """Extract (airline, price, nonstop) from a result card's aria-label / text."""
    label, text = card.get("label", ""), card.get("text", "")
    blob = f"{label} {text}"

    m = re.search(r"From\s+([\d,]+)\s+Indian rupees", label) or \
        re.search(r"From\s+₹\s?([\d,]+)", label) or \
        re.search(r"₹\s?([\d,]+)", text)
    if not m:
        return None
    price = float(m.group(1).replace(",", ""))
    if not (FARE_FLOOR <= price <= FARE_CEILING):
        return None

    airline = None
    m = re.search(r"flight with\s+(.+?)\s*\.", label)
    if m:
        airline = m.group(1).strip()
    if not airline:
        m = re.search(r"flight with\s+(.+?)(?:\.|$)", blob)
        airline = m.group(1).strip()[:50] if m else "Unknown Carrier"

    nonstop = bool(re.search(r"non[\s-]?stop", blob, re.IGNORECASE))
    return {"airline": airline[:50], "total_fare": price, "is_non_stop": nonstop}


async def scrape_horizon(page, route_code: str, orig: str, dest: str, horizon: int, today, debug: bool) -> list[dict]:
    departure = today + timedelta(days=horizon)
    url = SEARCH_URL.format(orig=orig, dest=dest, date=departure.isoformat())
    print(f"[{route_code} T+{horizon:>2}] {url}")
    await page.goto(url, wait_until="domcontentloaded")
    try:
        await page.wait_for_selector(RESULT_WAIT_SELECTOR, timeout=45000)
    except Exception:
        print(f"[{route_code} T+{horizon:>2}]   WARN: results selector timeout")
    await page.wait_for_timeout(3500)  # let results hydrate

    cards = await page.evaluate(JS_COLLECT_CARDS)
    if debug:
        out = ROOT / "worker" / f"debug_{route_code}_T{horizon}.html"
        out.write_text(await page.content(), encoding="utf-8")
        print(f"[{route_code} T+{horizon:>2}]   debug HTML -> {out.name}")

    quotes, seen = [], set()
    for card in cards:
        q = parse_quote(card)
        if not q:
            continue
        key = (q["airline"], q["total_fare"])
        if key in seen:
            continue
        seen.add(key)
        q["departure_date"] = departure
        q["lead_time_days"] = horizon
        q["origin"] = orig
        q["destination"] = dest
        q["route_code"] = route_code
        quotes.append(q)

    quotes.sort(key=lambda q: q["total_fare"])
    top3, carriers = [], set()
    for q in quotes:  # cheapest quote per distinct carrier, ranked by fare
        if q["airline"] in carriers:
            continue
        carriers.add(q["airline"])
        top3.append(q)
        if len(top3) == 3:
            break
    print(f"[{route_code} T+{horizon:>2}]   parsed {len(quotes)} quotes -> top 3: "
          + (", ".join(f"{q['airline']} Rs.{q['total_fare']:,.0f}" for q in top3) or "NONE"))
    return top3


async def run(args) -> int:
    from playwright.async_api import async_playwright

    horizons = [int(h) for h in args.horizons.split(",")] if args.horizons else HORIZONS
    today = datetime.now(IST).date()

    if args.all_routes:
        target_routes = list(DGCA_CORRIDORS.keys())
    elif args.routes:
        target_routes = [r.strip().upper() for r in args.routes.split(",") if r.strip().upper() in DGCA_CORRIDORS]
        if not target_routes:
            print(f"WARN: invalid route specification '{args.routes}' — defaulting to DEL-BOM")
            target_routes = ["DEL-BOM"]
    else:
        target_routes = ["DEL-BOM"]

    pw_cm = async_playwright()
    try:
        from playwright_stealth import Stealth
        pw_cm = Stealth().use_async(pw_cm)
        print("Stealth: playwright-stealth 2.x applied")
    except ImportError:
        print("WARN: playwright-stealth unavailable — running without stealth")

    captured_rows = []
    async with pw_cm as p:
        browser = await p.chromium.launch(headless=not args.headed)
        context = await browser.new_context(
            locale="en-IN", timezone_id="Asia/Kolkata",
            viewport={"width": 1440, "height": 900},
        )
        page = await context.new_page()

        for route_code in target_routes:
            orig, dest = DGCA_CORRIDORS[route_code]
            print(f"\n--- Corridor Sweep: {route_code} ({orig} -> {dest}) ---")
            for h in horizons:
                try:
                    quotes = await scrape_horizon(page, route_code, orig, dest, h, today, args.debug)
                    captured_rows.extend(quotes)
                except Exception as exc:
                    print(f"[{route_code} T+{h:>2}]   ERROR: {type(exc).__name__}: {exc}")
                # Network resilience: random delay jitter (2.0s to 4.0s) between requests
                await asyncio.sleep(random.uniform(2.0, 4.0))

        await context.close()
        await browser.close()

    if not captured_rows:
        print("\nFATAL: no quotes parsed from any horizon — nothing inserted.")
        return 1

    captured_at = datetime.now(timezone.utc)
    rows = []
    for q in captured_rows:
        base_fare, tax_and_fees = decompose_fare(q["total_fare"])
        rows.append((
            SOURCE_PORTAL, q["airline"], "N/A", q["origin"], q["destination"], q["route_code"],
            q["departure_date"], q["lead_time_days"],
            base_fare, tax_and_fees,
            q["total_fare"], q["is_non_stop"], captured_at
        ))

    print(f"\nScraped {len(rows)} quotes across {len(target_routes)} corridors x {len(horizons)} horizons "
          f"at {captured_at.isoformat(timespec='seconds')}")

    if args.dry_run:
        for r in rows:
            print(f"  [{r[5]}] T+{r[7]:>2} {r[1]:<15} fare={r[10]:>9,.2f} base={r[8]:>9,.2f} "
                  f"tax={r[9]:>8,.2f} nonstop={r[11]} dep={r[6]}")
        print("DRY RUN — nothing inserted.")
        return 0

    env = load_env(ROOT / ".env.local")
    conn = connect(env)
    try:
        with conn.cursor() as cur:
            psycopg2.extras.execute_values(cur, """
                INSERT INTO raw_airfare_quotes
                (source_portal, airline_name, flight_number, origin_airport,
                 destination_airport, route_code, departure_date, lead_time_days,
                 base_fare, tax_and_fees, total_fare, is_non_stop, captured_at)
                VALUES %s""", rows)
            cur.execute("SELECT COUNT(*) FROM raw_airfare_quotes WHERE source_portal = %s",
                        (SOURCE_PORTAL,))
            (total_live,) = cur.fetchone()
        conn.commit()
        print(f"Inserted {len(rows)} live rows (GoogleFlights-Live total: {total_live}).")
    finally:
        conn.close()
    return 0


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--headed", action="store_true")
    ap.add_argument("--debug", action="store_true", help="dump result-page HTML per horizon")
    ap.add_argument("--all-routes", action="store_true", help="Scrape all 10 DGCA corridors")
    ap.add_argument("--routes", default="", help="Comma-separated corridors, e.g. DEL-BOM,BLR-DEL (default: DEL-BOM)")
    ap.add_argument("--horizons", default="", help="comma-separated subset, e.g. 1,7")
    return asyncio.run(run(ap.parse_args()))


if __name__ == "__main__":
    sys.exit(main())
