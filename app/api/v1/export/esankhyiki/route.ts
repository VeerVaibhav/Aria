/**
 * MoSPI eSankhyiki statistical bulletin export.
 *
 *   GET /api/v1/export/esankhyiki            -> CSV download (default)
 *   GET /api/v1/export/esankhyiki?format=json -> JSON feed
 *
 * Schema (one row per quote_date x route_code):
 *   quote_date, route_code, origin, destination, dgca_weight,
 *   elementary_jevons_fare, weighted_route_price, national_apix_value
 *
 * elementary_jevons_fare is the quote-level Jevons price for the route-date,
 * recovered exactly from the elementary view:
 *   exp( sum_w n_w * ln(j_w) / sum_w n_w )
 * since j_w = exp(mean of ln over window w's quotes) and the quote-level
 * Jevons pools every quote's log-fare across windows.
 */

import { NextResponse } from "next/server";
import { getClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const CSV_COLUMNS = [
  "quote_date",
  "route_code",
  "origin",
  "destination",
  "dgca_weight",
  "elementary_jevons_fare",
  "weighted_route_price",
  "national_apix_value",
] as const;

type ExportRow = {
  quote_date: string;
  route_code: string;
  origin: string;
  destination: string;
  dgca_weight: number;
  elementary_jevons_fare: number;
  weighted_route_price: number;
  national_apix_value: number;
};

function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: Request) {
  const format = (new URL(request.url).searchParams.get("format") ?? "csv").toLowerCase();
  if (format !== "csv" && format !== "json") {
    return NextResponse.json(
      { error: "Unsupported format. Use ?format=csv (default) or ?format=json." },
      { status: 400 },
    );
  }

  try {
    const supabase = getClient();

    // view_elementary_prices exceeds PostgREST's default 1,000-row cap — paginate.
    const PAGE = 1000;
    const elementary: Array<{
      quote_date: string; route_code: string; sample_size: number; jevons_total_fare: number;
    }> = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from("view_elementary_prices")
        .select("*")
        .order("quote_date")
        .range(from, from + PAGE - 1);
      if (error) throw new Error(`Supabase query failed: ${error.message}`);
      if (!data || data.length === 0) break;
      elementary.push(...(data as typeof elementary));
      if (data.length < PAGE) break;
    }

    const [routeRes, natlRes, weightsRes] = await Promise.all([
      supabase.from("view_route_daily_price").select("*").order("quote_date"),
      supabase.from("view_national_apix").select("*").order("quote_date"),
      supabase.from("dgca_route_weights").select("route_code, origin_airport, destination_airport, weight_factor"),
    ]);
    const err = routeRes.error || natlRes.error || weightsRes.error;
    if (err) throw new Error(`Supabase query failed: ${err.message}`);

    // Quote-level Jevons per (quote_date, route_code) from window aggregates
    const logAcc = new Map<string, { wSum: number; lnSum: number }>();
    for (const e of elementary) {
      const key = `${e.quote_date}|${e.route_code}`;
      const acc = logAcc.get(key) ?? { wSum: 0, lnSum: 0 };
      acc.wSum += e.sample_size;
      acc.lnSum += e.sample_size * Math.log(e.jevons_total_fare);
      logAcc.set(key, acc);
    }

    const geo = (route: string, origin: string, dest: string) =>
      `${route}|${origin}|${dest}`;
    const weightByRoute = new Map(
      ((weightsRes.data ?? []) as Array<{
        route_code: string; origin_airport: string; destination_airport: string; weight_factor: number;
      }>).map((w) => [w.route_code, w]),
    );
    const priceByDateRoute = new Map(
      ((routeRes.data ?? []) as Array<{
        quote_date: string; route_code: string; weighted_route_price: number;
      }>).map((r) => [`${r.quote_date}|${r.route_code}`, r.weighted_route_price]),
    );
    const apixByDate = new Map(
      ((natlRes.data ?? []) as Array<{ quote_date: string; apix_index_value: number }>).map(
        (n) => [n.quote_date, n.apix_index_value],
      ),
    );

    const rows: ExportRow[] = [];
    for (const [key, acc] of Array.from(logAcc.entries()).sort(([a], [b]) => a.localeCompare(b))) {
      const [quote_date, route_code] = key.split("|");
      const w = weightByRoute.get(route_code);
      const weighted = priceByDateRoute.get(key);
      const apix = apixByDate.get(quote_date);
      if (!w || weighted == null || apix == null) continue;
      rows.push({
        quote_date,
        route_code,
        origin: w.origin_airport,
        destination: w.destination_airport,
        dgca_weight: w.weight_factor,
        elementary_jevons_fare: Math.round(Math.exp(acc.lnSum / acc.wSum) * 100) / 100,
        weighted_route_price: weighted,
        national_apix_value: apix,
      });
    }

    if (format === "json") {
      return NextResponse.json(
        {
          bulletin: "mospi_esankhyiki_apix",
          generated_at: new Date().toISOString(),
          row_count: rows.length,
          schema: CSV_COLUMNS,
          rows,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const body =
      CSV_COLUMNS.join(",") +
      "\n" +
      rows
        .map((r) =>
          [
            r.quote_date,
            csvEscape(r.route_code),
            csvEscape(r.origin),
            csvEscape(r.destination),
            r.dgca_weight,
            r.elementary_jevons_fare,
            r.weighted_route_price,
            r.national_apix_value,
          ].join(","),
        )
        .join("\n") +
      "\n";

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="mospi_esankhyiki_apix_bulletin.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Export unavailable", detail: message }, { status: 503 });
  }
}
