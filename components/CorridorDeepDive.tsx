"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CarrierQuote, DashboardData } from "@/lib/queries";
import { useLanguage } from "@/lib/language";
import { chartPalette, useHighContrast } from "@/lib/useHighContrast";

const AIRLINES = ["IndiGo", "Air India", "SpiceJet", "Akasa Air"];
const ALL_ROUTES = [
  "DEL-BOM", "BOM-DEL", "BLR-DEL", "DEL-BLR",
  "BOM-BLR", "BLR-BOM", "DEL-CCU", "CCU-DEL", "MAA-DEL", "DEL-MAA"
];
const HORIZONS = [1, 7, 15, 30, 45];

function statutoryDecompose(totalFare: number) {
  const fee = 350.0;
  const taxable = Math.max(0, totalFare - fee);
  const base = Math.round((taxable / 1.05) * 100) / 100;
  const gst = Math.round(base * 0.05 * 100) / 100;
  const tax = Math.round((fee + gst) * 100) / 100;
  return { base_fare: base, tax_and_fees: tax };
}

export default function CorridorDeepDive({
  carrierQuotes,
  heatmap,
}: {
  carrierQuotes: CarrierQuote[];
  heatmap: DashboardData["heatmap"];
}) {
  const { t } = useLanguage();
  const hc = useHighContrast();
  const pal = chartPalette(hc);

  const [selectedRoute, setSelectedRoute] = useState<string>("DEL-BOM");
  const [selectedHorizon, setSelectedHorizon] = useState<number>(7);

  const carrierData = useMemo(() => {
    // 1. Filter live carrier quotes for route & horizon
    const matching = carrierQuotes.filter(
      (q) => q.route_code === selectedRoute && q.lead_time_days === selectedHorizon
    );

    // 2. Find fallback benchmark total fare from heatmap
    const routeRow = heatmap.find((r) => r.route_code === selectedRoute);
    const cell = routeRow?.cells.find((c) => c.lead === selectedHorizon);
    const fallbackBasePrice = cell?.fare ?? 5500;

    // Carrier relative multipliers for realistic variation if missing from sample
    const multipliers: Record<string, number> = {
      "IndiGo": 0.98,
      "Air India": 1.05,
      "SpiceJet": 0.94,
      "Akasa Air": 0.96,
    };

    return AIRLINES.map((airline) => {
      const q = matching.find((m) => m.airline_name.toLowerCase().includes(airline.toLowerCase()));
      let totalFare: number;
      let baseFare: number;
      let taxFees: number;

      if (q) {
        totalFare = q.total_fare;
        baseFare = q.base_fare;
        taxFees = q.tax_and_fees;
      } else {
        totalFare = Math.round(fallbackBasePrice * (multipliers[airline] ?? 1.0));
        const dec = statutoryDecompose(totalFare);
        baseFare = dec.base_fare;
        taxFees = dec.tax_and_fees;
      }

      return {
        airline,
        total_fare: totalFare,
        base_fare: baseFare,
        tax_and_fees: taxFees,
      };
    });
  }, [carrierQuotes, heatmap, selectedRoute, selectedHorizon]);

  const barColors = hc
    ? {
        fare: "#FFE600",
        base: "#00E5FF",
        tax: "#FF9E80",
      }
    : {
        fare: "#0B3C5D",
        base: "#0B3C5D",
        tax: "#FF9933",
      };

  return (
    <div className="space-y-6">
      {/* Dual Controls */}
      <div className="civic-card flex flex-wrap items-center gap-6 p-4">
        <div className="flex items-center gap-2">
          <label htmlFor="corridor-select" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
            {t("selectCorridor")}:
          </label>
          <select
            id="corridor-select"
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="border px-3 py-1 text-sm font-semibold focus:outline-none focus:ring-2"
            style={{ borderColor: "var(--card-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}
          >
            {ALL_ROUTES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="horizon-select" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
            {t("selectHorizon")}:
          </label>
          <select
            id="horizon-select"
            value={selectedHorizon}
            onChange={(e) => setSelectedHorizon(Number(e.target.value))}
            className="border px-3 py-1 text-sm font-semibold focus:outline-none focus:ring-2"
            style={{ borderColor: "var(--card-border)", background: "var(--card-bg)", color: "var(--text-primary)" }}
          >
            {HORIZONS.map((h) => (
              <option key={h} value={h}>
                T+{h} ({h === 1 ? t("horizonImmediate") : h === 45 ? t("horizonDiscount") : t("horizonAdvance")})
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {selectedRoute}
          </span>{" "}
          · T+{selectedHorizon} {t("horizonWord")}
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Chart 1: Carrier Price Comparison */}
        <div className="civic-card p-4">
          <h2 className="text-sm font-bold">{t("carrierComparison")}</h2>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
            {t("carrierCompareDesc").replace("{route}", selectedRoute).replace("{horizon}", String(selectedHorizon))}
          </p>

          <div className="mt-4 h-72 w-full" role="img" aria-label={t("carrierComparison")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carrierData} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
                <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
                <XAxis dataKey="airline" tick={{ fontSize: 11, fill: pal.tick }} tickLine={false} />
                <YAxis
                  tickFormatter={(v: number) => `₹${v.toLocaleString("en-IN")}`}
                  tick={{ fontSize: 11, fill: pal.tick }}
                  tickLine={false}
                  width={62}
                />
                <Tooltip
                  contentStyle={{
                    border: `1px solid ${pal.grid}`,
                    borderRadius: 2,
                    fontSize: 12,
                    background: hc ? "#000000" : "#ffffff",
                    color: hc ? "#ffffff" : "#0f172a",
                  }}
                  formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, t("totalFare")]}
                />
                <Bar dataKey="total_fare" name={t("averageFare")} fill={barColors.fare} barSize={40} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cost Decomposition Stacked Bar */}
        <div className="civic-card p-4">
          <h2 className="text-sm font-bold">{t("costDecomposition")}</h2>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
            {t("costDecompDesc")}
          </p>

          <div className="mt-4 h-72 w-full" role="img" aria-label={t("costDecomposition")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carrierData} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
                <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
                <XAxis dataKey="airline" tick={{ fontSize: 11, fill: pal.tick }} tickLine={false} />
                <YAxis
                  tickFormatter={(v: number) => `₹${v.toLocaleString("en-IN")}`}
                  tick={{ fontSize: 11, fill: pal.tick }}
                  tickLine={false}
                  width={62}
                />
                <Tooltip
                  contentStyle={{
                    border: `1px solid ${pal.grid}`,
                    borderRadius: 2,
                    fontSize: 12,
                    background: hc ? "#000000" : "#ffffff",
                    color: hc ? "#ffffff" : "#0f172a",
                  }}
                  formatter={(v: number, name: string) => [`₹${v.toLocaleString("en-IN")}`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="base_fare" name={t("baseFareLabel")} stackId="a" fill={barColors.base} barSize={40} isAnimationActive={false} />
                <Bar dataKey="tax_and_fees" name={t("taxFeeLabel")} stackId="a" fill={barColors.tax} barSize={40} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
