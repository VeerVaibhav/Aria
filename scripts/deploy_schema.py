"""
APIx Phase 1 — Deploy SCHEMA.sql to Supabase and verify the index engine.

Usage:
    python scripts/deploy_schema.py

Reads credentials from .env (never hardcode them here).
Idempotent: SCHEMA.sql uses IF NOT EXISTS / OR REPLACE throughout.
"""

import sys
from pathlib import Path

import psycopg2

ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT / ".env"
SCHEMA_FILE = ROOT / "SCHEMA.sql"


def load_env(path: Path) -> dict:
    env = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        env[key.strip()] = value.strip()
    return env


def main() -> int:
    env = load_env(ENV_FILE)
    required = [
        "SUPABASE_DB_HOST", "SUPABASE_DB_PORT",
        "SUPABASE_DB_NAME", "SUPABASE_DB_USER", "SUPABASE_DB_PASSWORD",
    ]
    missing = [k for k in required if not env.get(k)]
    if missing:
        print(f"FATAL: missing DB credentials in {ENV_FILE.name}: {missing}")
        return 1

    dsn = {
        "host": env["SUPABASE_DB_HOST"],
        "port": env["SUPABASE_DB_PORT"],
        "dbname": env["SUPABASE_DB_NAME"],
        "user": env["SUPABASE_DB_USER"],
        "password": env["SUPABASE_DB_PASSWORD"],
        "connect_timeout": 20,
        "sslmode": "require",
    }
    print(f"Connecting to {dsn['host']}:{dsn['port']} as {dsn['user']} ...")
    try:
        conn = psycopg2.connect(**dsn)
    except Exception as exc:
        print(f"FATAL: connection failed: {type(exc).__name__}: {exc}")
        return 2

    try:
        sql = SCHEMA_FILE.read_text(encoding="utf-8")
        with conn.cursor() as cur:
            print(f"Executing {SCHEMA_FILE.name} ({len(sql)} bytes) ...")
            cur.execute(sql)  # psycopg2 simple-query protocol runs all statements
            notices = [n.strip() for n in conn.notices if n]
            for n in notices:
                print(f"  notice: {n}")
        conn.commit()
        print("Schema deployed and committed.\n")

        verify(conn)
    finally:
        conn.close()
    return 0


def verify(conn) -> None:
    checks = [
        ("Tables",
         "SELECT table_name FROM information_schema.tables "
         "WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY 1"),
        ("Views",
         "SELECT table_name FROM information_schema.views "
         "WHERE table_schema='public' ORDER BY 1"),
        ("DGCA route weights seeded",
         "SELECT route_code, route_name, weight_factor, base_fare_p0 "
         "FROM dgca_route_weights ORDER BY weight_factor DESC"),
        ("RLS policies",
         "SELECT tablename, policyname FROM pg_policies WHERE schemaname='public' ORDER BY 1, 2"),
        ("Historical quote rows",
         "SELECT COUNT(*) FROM raw_airfare_quotes"),
        ("view_national_apix (pre-seed)",
         "SELECT * FROM view_national_apix LIMIT 5"),
    ]
    with conn.cursor() as cur:
        for label, query in checks:
            print(f"--- {label} ---")
            cur.execute(query)
            rows = cur.fetchall()
            if not rows:
                print("  (empty)")
            for row in rows:
                print(f"  {row}")
            print()


if __name__ == "__main__":
    sys.exit(main())
