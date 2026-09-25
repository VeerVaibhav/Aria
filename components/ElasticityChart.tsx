"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardData } from "@/lib/queries";
import { useLanguage } from "@/lib/language";
import { chartPalette, useHighContrast } from "@/lib/useHighContrast";

const ROUTE_COLORS = ["#0B3C5D", "#B45309", "#138808", "#7C2D12", "#475569", "#9A3412", "#1D4ED8", "#166534", "#92400E", "#334155"];
const ROUTE_COLORS_HC = ["#FFE600", "#00E5FF", "#7CFC00", "#FF9E80", "#E0E0E0", "#FFD54F", "#82B1FF", "#B9F6CA", "#FFAB91", "#F5F5F5"];

export default function ElasticityChart({ elasticity }: { elasticity: DashboardData["elasticity"] }) {
  const { t } = useLanguage();
  const hc = useHighContrast();
  const pal = chartPalette(hc);
  const routeColors = hc ? ROUTE_COLORS_HC : ROUTE_COLORS;
  // PRD: escalation curve displayed from T+45 down to T+1
  const data = [...elasticity].sort((a, b) => b.lead_time_days - a.lead_time_days);
  const routeKeys = Object.keys(data[0] ?? {}).filter((k) => k !== "lead_time_days" && k !== "national");

  return (
    <div className="h-80 w-full" role="img" aria-label={t("chartElasticityTitle")}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="lead_time_days"
            tickFormatter={(v: number) => `T+${v}`}
            tick={{ fontSize: 11, fill: pal.tick }}
            tickLine={false}
          />
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
            labelFormatter={(v: number) => t("windowLabel").replace("{n}", String(v))}
            formatter={(value: number, name: string) => [`₹${Number(value).toLocaleString("en-IN")}`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="national" name={t("chartNationalLegend")} stroke={pal.primary} strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
          {routeKeys.map((route, i) => (
            <Line
              key={route}
              type="monotone"
              dataKey={route}
              name={route}
              stroke={routeColors[i % routeColors.length]}
              strokeWidth={1}
              strokeOpacity={0.55}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
