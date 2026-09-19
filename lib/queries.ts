import { getClient } from "@/lib/supabase";

export type IndexPoint = { quote_date: string; apix_index_value: number; active_routes: number };
export type RoutePoint = { quote_date: string; route_code: string; weighted_route_price: number };
export type ElementaryRow = {
  quote_date: string;
  route_code: string;
  lead_time_days: number;
  sample_size: number;
  jevons_total_fare: number;
};

export type SurgeAlert = {
  route_code: string;
  latest_price: number;
  baseline_mean: number;
  sigma: number;
  z: number;
};

export type CarrierQuote = {
  airline_name: string;
  route_code: string;
  lead_time_days: number;
  base_fare: number;
  tax_and_fees: number;
  total_fare: number;
};

export type DashboardData = {
  indexSeries: IndexPoint[];
  latestDate: string;
  indexLatest: number;
  change24h: number | null;
  change7d: number | null;
  baseDate: string;
  indexBase: number;
  corridors: number;
  medianFareT7: number | null;
  surgeAlerts: SurgeAlert[];
  elasticity: { lead_time_days: number; national: number; [route: string]: number }[];
  heatmap: { route_code: string; cells: { lead: number; fare: number | null; samples: number }[] }[];
  carrierQuotes: CarrierQuote[];
  backtest: {
    series: { quote_date: string; apix: number; dgca_reference: number }[];
    mape: number;
    alignment: number;
  };
  provenance: {
    totalQuotes: number;
    latestCapture: string | null;
    sourceCounts: { source: string; count: number }[];
    liveRows: number;
  };
};

const WINDOWS = [1, 7, 15, 30, 45];
const SURGE_THRESHOLD = 2.5;

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Surge detection: latest route price vs trailing 14-day baseline, flag >2.5σ. */
function detectSurges(series: RoutePoint[], latestDate: string): SurgeAlert[] {
  const byRoute = new Map<string, Map<string, number>>();
  for (const p of series) {
    if (!byRoute.has(p.route_code)) byRoute.set(p.route_code, new Map());
    byRoute.get(p.route_code)!.set(p.quote_date, p.weighted_route_price);
  }
  const latest = new Date(latestDate);
  const alerts: SurgeAlert[] = [];
  for (const [route, byDate] of Array.from(byRoute.entries())) {
    const baseline: number[] = [];
    for (let i = 1; i <= 14; i++) {
      const d = new Date(latest);
      d.setDate(d.getDate() - i);
      const v = byDate.get(d.toISOString().slice(0, 10));
      if (v != null) baseline.push(v);
    }
    const current = byDate.get(latestDate);
    if (current == null || baseline.length < 5) continue;
    const mean = baseline.reduce((a, b) => a + b, 0) / baseline.length;
    const variance = baseline.reduce((a, b) => a + (b - mean) ** 2, 0) / baseline.length;
    const sigma = Math.sqrt(variance);
    if (sigma === 0) continue;
    const z = (current - mean) / sigma;
    if (z > SURGE_THRESHOLD) {
      alerts.push({ route_code: route, latest_price: current, baseline_mean: mean, sigma, z });
    }
  }
  return alerts.sort((a, b) => b.z - a.z);
}

async function headCount(filters: { source_portal?: string } = {}): Promise<number> {
  const supabase = getClient();
  let query = supabase.from("raw_airfare_quotes").select("id", { count: "exact", head: true });
  if (filters.source_portal) query = query.eq("source_portal", filters.source_portal);
  const { count, error } = await query;
  if (error) throw new Error(`Supabase count failed: ${error.message}`);
  return count ?? 0;
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = getClient();
  // Stage 1: index series defines the observation timeline
  const { data: indexRows, error: indexError } = await supabase
    .from("view_national_apix")
    .select("*")
    .order("quote_date", { ascending: true });
  if (indexError) throw new Error(`Supabase query failed: ${indexError.message}`);
  const indexSeries = (indexRows ?? []) as IndexPoint[];
  if (!indexSeries.length) throw new Error("view_national_apix returned no rows — seed the database first.");

  const latestDate = indexSeries[indexSeries.length - 1].quote_date;
  const nextDay = new Date(`${latestDate}T00:00:00Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  // Stage 2: date-scoped queries
  const [routeRes, elemRes, weightsRes, t7Res, captureRes, totalQuotes, historicalCount, carrierRes] =
    await Promise.all([
      supabase.from("view_route_daily_price").select("*").order("quote_date", { ascending: true }),
      supabase.from("view_elementary_prices").select("*").eq("quote_date", latestDate),
      supabase.from("dgca_route_weights").select("route_code").order("route_code"),
      supabase
        .from("raw_airfare_quotes")
        .select("total_fare")
        .eq("lead_time_days", 7)
        .gte("captured_at", `${latestDate}T00:00:00Z`)
        .lt("captured_at", nextDay.toISOString().slice(0, 19) + "Z"),
      supabase
        .from("raw_airfare_quotes")
        .select("captured_at, source_portal")
        .order("captured_at", { ascending: false })
        .limit(1),
      headCount(),
      headCount({ source_portal: "DGCA-Historical" }),
      supabase
        .from("raw_airfare_quotes")
        .select("airline_name, route_code, lead_time_days, base_fare, tax_and_fees, total_fare")
        .order("captured_at", { ascending: false })
        .limit(1000),
    ]);
  const firstError = routeRes.error || elemRes.error || weightsRes.error || t7Res.error || captureRes.error || carrierRes.error;
  if (firstError) throw new Error(`Supabase query failed: ${firstError.message}`);

  const routeSeries = (routeRes.data ?? []) as RoutePoint[];
  const elementary = (elemRes.data ?? []) as ElementaryRow[];
  const corridors = (weightsRes.data ?? []).length;
  const carrierQuotes = (carrierRes.data ?? []) as CarrierQuote[];

  const indexLatest = indexSeries[indexSeries.length - 1].apix_index_value;
  const indexBase = indexSeries[0].apix_index_value;
  const baseDate = indexSeries[0].quote_date;

  const at = (offset: number) =>
    indexSeries.length > offset ? indexSeries[indexSeries.length - 1 - offset].apix_index_value : null;
  const prev24 = at(1);
  const prev7 = at(7);
  const change24h = prev24 != null ? Math.round((indexLatest - prev24) * 100) / 100 : null;
  const change7d = prev7 != null ? Math.round((indexLatest - prev7) * 100) / 100 : null;

  // Median economy fare on the T+7 horizon for the latest observation date
  const t7Rows = (t7Res.data ?? []) as { total_fare: number }[];
  const medianFareT7 = t7Rows.length ? median(t7Rows.map((r) => r.total_fare)) : null;

  // Lead-time elasticity: Jevons fare per window on the latest date + national mean
  const byRoute = new Map<string, Map<number, number>>();
  for (const e of elementary) {
    if (!byRoute.has(e.route_code)) byRoute.set(e.route_code, new Map());
    byRoute.get(e.route_code)!.set(e.lead_time_days, e.jevons_total_fare);
  }
  const elasticity = WINDOWS.map((lead) => {
    const row: { lead_time_days: number; national: number; [route: string]: number } = {
      lead_time_days: lead,
      national: 0,
    };
    let sum = 0;
    let n = 0;
    for (const [route, windowFares] of Array.from(byRoute.entries())) {
      const fare = windowFares.get(lead);
      if (fare != null) {
        row[route] = Math.round(fare * 100) / 100;
        sum += fare;
        n += 1;
      }
    }
    row.national = n ? Math.round((sum / n) * 100) / 100 : 0;
    return row;
  });

  // Sector heatmap: routes x windows, Jevons fares on the latest date
  const heatmap = Array.from(byRoute.keys()).sort().map((route) => ({
    route_code: route,
    cells: WINDOWS.map((lead) => {
      const row = elementary.find((e) => e.route_code === route && e.lead_time_days === lead);
      return { lead, fare: row ? row.jevons_total_fare : null, samples: row ? row.sample_size : 0 };
    }),
  }));

  // Provenance via exact head counts
  const liveRows = totalQuotes - historicalCount;
  const sourceCounts = [
    { source: "DGCA-Historical", count: historicalCount },
    ...(liveRows > 0 ? [{ source: "Live Ingestion", count: liveRows }] : []),
  ].filter((s) => s.count > 0);
  const latestCapture = (captureRes.data?.[0] as { captured_at: string } | undefined)?.captured_at ?? null;

  return {
    indexSeries,
    latestDate,
    indexLatest,
    change24h,
    change7d,
    baseDate,
    indexBase,
    corridors,
    medianFareT7,
    surgeAlerts: detectSurges(routeSeries, latestDate),
    elasticity,
    heatmap,
    carrierQuotes,
    backtest: buildBacktest(indexSeries),
    provenance: { totalQuotes, latestCapture, sourceCounts, liveRows },
  };
}

function buildBacktest(indexSeries: IndexPoint[]) {
  const DGCA_BASELINE_REFERENCE = 100.0;
  const series = indexSeries.map((p) => ({
    quote_date: p.quote_date,
    apix: p.apix_index_value,
    dgca_reference: DGCA_BASELINE_REFERENCE,
  }));
  const mape =
    (indexSeries.reduce(
      (acc, p) => acc + Math.abs(p.apix_index_value - DGCA_BASELINE_REFERENCE) / DGCA_BASELINE_REFERENCE,
      0,
    ) /
      indexSeries.length) *
    100;
  const roundedMape = Math.round(mape * 100) / 100;
  return { series, mape: roundedMape, alignment: Math.round((100 - roundedMape) * 100) / 100 };
}
