"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { DashboardData } from "@/lib/queries";
import { useLanguage } from "@/lib/language";

export default function AnomaliesView({ data }: { data: DashboardData }) {
  const { t } = useLanguage();

  const mockAnomalies = [
    {
      corridor: "BOM-DEL",
      horizon: "T+1",
      fare: "₹9,850",
      sigma: "+3.12σ",
      status: "MoCA Cap Exceeded",
      risk: "CRITICAL",
    },
    {
      corridor: "DEL-PNQ",
      horizon: "T+1",
      fare: "₹8,420",
      sigma: "+2.85σ",
      status: "Festive Spike",
      risk: "HIGH",
    },
    {
      corridor: "BLR-DEL",
      horizon: "T+7",
      fare: "₹9,201",
      sigma: "+2.64σ",
      status: "Capacity Deficit",
      risk: "HIGH",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="civic-card p-4">
        <div className="flex items-center gap-2.5 border-b pb-3" style={{ borderColor: "var(--card-border)" }}>
          <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden />
          <div>
            <h2 className="text-base font-bold">Surge Detection & MoCA Price Cap Breaches</h2>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Real-time volatility alerts flag fares exceeding &gt;2.5σ standard deviation threshold
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--card-border)" }}>
                <th className="py-2 px-3 font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Corridor</th>
                <th className="py-2 px-3 font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Horizon</th>
                <th className="py-2 px-3 font-semibold uppercase text-right" style={{ color: "var(--text-secondary)" }}>Current Fare</th>
                <th className="py-2 px-3 font-semibold uppercase text-right" style={{ color: "var(--text-secondary)" }}>Z-Score</th>
                <th className="py-2 px-3 font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Anomaly Type</th>
                <th className="py-2 px-3 font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>Risk Tier</th>
              </tr>
            </thead>
            <tbody>
              {mockAnomalies.map((a, i) => (
                <tr key={i} className="border-b" style={{ borderColor: "var(--card-border)" }}>
                  <td className="py-2.5 px-3 font-bold">{a.corridor}</td>
                  <td className="py-2.5 px-3 font-mono">{a.horizon}</td>
                  <td className="py-2.5 px-3 text-right font-bold tabular-nums">{a.fare}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-red-600 font-bold">{a.sigma}</td>
                  <td className="py-2.5 px-3">{a.status}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                      <ShieldAlert className="h-3 w-3" /> {a.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
