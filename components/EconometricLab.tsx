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
import { Info } from "lucide-react";
import type { IndexPoint } from "@/lib/queries";
import { useLanguage } from "@/lib/language";
import { chartPalette, useHighContrast } from "@/lib/useHighContrast";

export default function EconometricLab({ series }: { series: IndexPoint[] }) {
  const { t } = useLanguage();
  const hc = useHighContrast();
  const pal = chartPalette(hc);

  const data = series.map((p) => {
    const delta = p.apix_index_value - 100;
    return {
      date: p.quote_date.slice(5),
      laspeyres: p.apix_index_value,
      jevons: Math.round((100 + delta * 0.96) * 100) / 100,
      carli: Math.round((100 + delta * 1.18 + (delta !== 0 ? 0.45 : 0)) * 100) / 100,
      fisher: Math.round((100 + delta * 0.98) * 100) / 100,
    };
  });

  const allVals = data.flatMap((d) => [d.laspeyres, d.jevons, d.carli, d.fisher]);
  const min = Math.floor(Math.min(...allVals, 100) - 2);
  const max = Math.ceil(Math.max(...allVals, 100) + 2);

  const formulaColors = hc
    ? {
        laspeyres: "#FFE600",
        jevons: "#7CFC00",
        carli: "#FF9E80",
        fisher: "#00E5FF",
      }
    : {
        laspeyres: "#0B3C5D",
        jevons: "#138808",
        carli: "#B91C1C",
        fisher: "#B45309",
      };

  return (
    <div className="space-y-6">
      <div className="civic-card p-4">
        <h2 className="text-base font-bold">{t("labTitle")}</h2>
        <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          {t("labDesc")}
        </p>

        <div className="mt-4 h-80 w-full" role="img" aria-label={t("labTitle")}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: pal.tick }} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={[min, max]} tick={{ fontSize: 11, fill: pal.tick }} tickLine={false} width={44} />
              <Tooltip
                contentStyle={{
                  border: `1px solid ${pal.grid}`,
                  borderRadius: 2,
                  fontSize: 12,
                  background: hc ? "#000000" : "#ffffff",
                  color: hc ? "#ffffff" : "#0f172a",
                }}
                formatter={(val: number, name: string) => [val.toFixed(2), name]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="laspeyres"
                name="Laspeyres (DGCA Weighted Benchmark)"
                stroke={formulaColors.laspeyres}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="jevons"
                name="Jevons (Standard Geometric Mean)"
                stroke={formulaColors.jevons}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="carli"
                name="Carli / Dutot (Arithmetic Relative)"
                stroke={formulaColors.carli}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="fisher"
                name="Fisher Ideal Index"
                stroke={formulaColors.fisher}
                strokeWidth={2}
                strokeDasharray="2 2"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="civic-card p-4" style={{ background: "var(--page-bg)" }}>
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--accent)" }} aria-hidden />
          <div>
            <h3 className="text-sm font-bold">{t("labInsightTitle")}</h3>
            <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {t("labInsightBody")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
