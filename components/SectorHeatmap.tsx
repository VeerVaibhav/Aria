"use client";

import { useState } from "react";
import type { DashboardData } from "@/lib/queries";
import { useLanguage } from "@/lib/language";

const WINDOW_LABELS: Record<number, string> = { 1: "T+1", 7: "T+7", 15: "T+15", 30: "T+30", 45: "T+45" };

/** Saffron intensity scale on white — civic, high legibility. */
function fareColor(fare: number, min: number, max: number): string {
  if (max === min) return "rgba(255,153,51,0.35)";
  const t = (fare - min) / (max - min);
  const alpha = 0.12 + t * 0.72;
  return `rgba(255,153,51,${alpha.toFixed(3)})`;
}

export default function SectorHeatmap({ heatmap }: { heatmap: DashboardData["heatmap"] }) {
  const { lang, t } = useLanguage();
  const [selectedRoute, setSelectedRoute] = useState<string>("ALL");

  const availableRoutes = heatmap.map((r) => r.route_code);
  const filteredRows = selectedRoute === "ALL" ? heatmap : heatmap.filter((r) => r.route_code === selectedRoute);

  const allFares = heatmap.flatMap((r) => r.cells.map((c) => c.fare).filter((f): f is number => f != null));
  const min = allFares.length ? Math.min(...allFares) : 0;
  const max = allFares.length ? Math.max(...allFares) : 1;
  const leads = heatmap[0]?.cells.map((c) => c.lead) ?? [45, 30, 15, 7, 1];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="heatmap-route-filter" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
          {t("selectCorridor")}:
        </label>
        <select
          id="heatmap-route-filter"
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
          className="border px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2"
          style={{
            borderColor: "var(--card-border)",
            background: "var(--card-bg)",
            color: "var(--text-primary)",
          }}
        >
          <option value="ALL">{t("allCorridors")}</option>
          {availableRoutes.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <caption className="sr-only">
            {lang === "hi" ? "मार्ग और बुकिंग विंडो के अनुसार औसत इकोनॉमी किराया" : "Average economy fare by corridor and advance-purchase window"}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="border-b px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)", borderColor: "var(--card-border)" }}>
                {lang === "hi" ? "मार्ग" : "Corridor"}
              </th>
              {leads.map((lead) => (
                <th key={lead} scope="col" className="border-b px-3 py-2 text-center text-xs font-semibold" style={{ color: "var(--text-secondary)", borderColor: "var(--card-border)" }}>
                  {WINDOW_LABELS[lead] ?? `T+${lead}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.route_code}>
                <th scope="row" className="px-3 py-1.5 text-left font-semibold" style={{ color: "var(--text-primary)" }}>
                  {row.route_code}
                </th>
                {row.cells.map((cell) => (
                  <td
                    key={cell.lead}
                    className="border px-2 py-1.5 text-center tabular-nums"
                    style={{
                      borderColor: "var(--card-border)",
                      background: cell.fare != null ? fareColor(cell.fare, min, max) : "transparent",
                      color: "var(--text-primary)",
                    }}
                    title={
                      cell.fare != null
                        ? `${row.route_code} ${WINDOW_LABELS[cell.lead]}: ₹${cell.fare.toLocaleString("en-IN")} (${cell.samples} quotes)`
                        : `${row.route_code} ${WINDOW_LABELS[cell.lead]}: no quotes`
                    }
                  >
                    {cell.fare != null ? `₹${Math.round(cell.fare).toLocaleString("en-IN")}` : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
