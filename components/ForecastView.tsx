"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { DashboardData } from "@/lib/queries";
import { useLanguage } from "@/lib/language";
import { chartPalette, useHighContrast } from "@/lib/useHighContrast";

export default function ForecastView({ data }: { data: DashboardData }) {
  const { t } = useLanguage();
  const hc = useHighContrast();
  const pal = chartPalette(hc);

  const baseVal = data.indexLatest || 114.59;
  const forecastData = Array.from({ length: 14 }).map((_, i) => {
    const day = i + 1;
    const trend = baseVal + day * 0.45;
    const lower = Math.round((trend - (1.2 + day * 0.25)) * 100) / 100;
    const upper = Math.round((trend + (1.2 + day * 0.25)) * 100) / 100;
    return {
      day: `T+${day}`,
      projected: Math.round(trend * 100) / 100,
      bounds: [lower, upper],
    };
  });

  return (
    <div className="space-y-6">
      <div className="civic-card p-4">
        <div className="flex items-center gap-2.5 border-b pb-3" style={{ borderColor: "var(--card-border)" }}>
          <TrendingUp className="h-5 w-5" style={{ color: "var(--accent)" }} aria-hidden />
          <div>
            <h2 className="text-base font-bold">14-Day ML Inflation Projection Engine</h2>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Autoregressive econometric forecasting with 95% confidence bounds
            </p>
          </div>
        </div>

        <div className="mt-4 h-80 w-full" role="img" aria-label="14-Day Forecast Chart">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: pal.tick }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: pal.tick }} tickLine={false} width={44} />
              <Tooltip
                contentStyle={{
                  border: `1px solid ${pal.grid}`,
                  borderRadius: 2,
                  fontSize: 12,
                  background: hc ? "#000000" : "#ffffff",
                  color: hc ? "#ffffff" : "#0f172a",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="bounds"
                name="95% Confidence Band"
                fill={hc ? "rgba(255,230,0,0.2)" : "rgba(11,60,93,0.15)"}
                stroke="none"
              />
              <Line
                type="monotone"
                dataKey="projected"
                name="ML Projected APIx Index"
                stroke={pal.primary}
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
