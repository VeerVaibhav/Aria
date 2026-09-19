# Execution Game Plan: APIx Platform (SIH26056)
**Mode:** Solo 24-Hour Sprint | **Target Stack:** Next.js (Vercel) + Supabase (PostgreSQL) + Local Python Worker

---

## 1. Execution Roadmap & Gate Checkpoints
[Phase 0: Groundwork] ──► Ingest Seed Data & Supabase Schema
│
▼ (GATE 1: Human Data Checkpoint)
[Phase 1: Database & Engine] ──► Execute SQL Schema & Compute Jevons/Laspeyres
│
▼ (GATE 2: Math Sanity Verification)
[Phase 2: GIGW Civic UI]    ──► Build Next.js Dashboard, Accessibility Bar & i18n
│
▼ (GATE 3: Visual & Accessibility Review)
[Phase 3: Live Worker]       ──► Local Playwright Google Flights Ingestion
│
▼ (GATE 4: End-to-End Ingestion Check)
[Phase 4: Validation Demo]   ──► 30-Day DGCA Backtesting Export & Freeze

---

## 2. Detailed Phase Breakdown

### Phase 0: Groundwork & Environment Handshake
- Setup Next.js repository with Tailwind CSS and Lucide React.
- Configure Supabase client (`@supabase/supabase-js`).
- Prepare `/data` directory for official DGCA passenger figures and baseline historical airfares.
- **GATE 1 (Human Checkpoint):** The AI harness must halt and ask the user:
  1. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  2. The path to the downloaded 30-day historical Kaggle/DGCA Indian airfare CSV.

### Phase 1: Database Deployment & Baseline Ingestion
- Run `SCHEMA.sql` against the Supabase database.
- Build `scripts/seed_historical.py` using Pandas to map the human-provided CSV into `raw_airfare_quotes`.
- Verify database views: `view_elementary_prices`, `view_route_daily_price`, and `view_national_apix`.
- **GATE 2 (Sanity Checkpoint):** The AI harness must query `view_national_apix` and output the first 5 records in terminal to prove the index equals ~100.00 base before proceeding.

### Phase 2: GIGW 3.0 Civic Frontend & State Integration
- Implement GIGW Top Bar:
  - Global font resizer (`A-`, `A`, `A+`) binding to root `font-size`.
  - High-Contrast toggle (Dark Inverted / Yellow-on-Black) meeting WCAG 2.1 AA.
  - Bilingual switcher (`EN` / `HI`) via static dictionary (`lib/i18n.ts`).
- Construct Institutional MoSPI / NSO Header (Ashoka Blue `#0B3C5D` with Saffron `#FF9933` and Green `#138808` subtle civic bands).
- Build 4 High-Level Metric Tiles: National Index (NAPI/APIx), Monitored Routes, Metro Median Economy Fare, and Volatility Watch.
- Implement Elasticity Chart: $T+45$ to $T+1$ fare escalation curve using `@tremor/react` or Recharts.
- Implement Data Trust Center Badge: Display data provenance, quote count, and freshness timestamp.
- **GATE 3 (Review Checkpoint):** Present the UI routes for human review on `localhost:3000`.

### Phase 3: Local Live Scraper Worker
- Write `worker/scraper.py` using `playwright` (async) and `playwright-stealth`.
- Implement single-route ingestion targeting `DEL-BOM` across departure windows ($T+1, T+7, T+15, T+30, T+45$) via Google Flights aggregator URLs.
- Implement automatic upsert to Supabase table `raw_airfare_quotes`.
- **GATE 4 (Live Ingestion Checkpoint):** Run `python worker/scraper.py` locally and verify that new live rows appear with `captured_at = NOW()` and correctly recompute the live index view.

### Phase 4: Backtesting Verification & eSankhyiki Export
- Generate the 30-day backtesting validation line chart comparing calculated APIx against published DGCA average monthly fare levels.
- Build API Route `/api/v1/export/esankhyiki` returning standardized CSV/JSON for MoSPI data intake.
- Deploy to Vercel and verify production build.

