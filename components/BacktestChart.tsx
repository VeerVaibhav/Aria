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
import { chartPalette, useHighContrast } from "@/lib/useHighContrast";
import { useLanguage } from "@/lib/language";

export default function BacktestChart({ backtest }: { backtest: DashboardData["backtest"] }) {
  const { t, lang } = useLanguage();
  const hc = useHighContrast();
  const pal = chartPalette(hc);

  const data = backtest.series.map((p) => ({
    date: p.quote_date.slice(5),
    apix: p.apix,
    dgca_reference: p.dgca_reference,
  }));
  const values = backtest.series.flatMap((p) => [p.apix, p.dgca_reference]);
  const min = Math.floor(Math.min(...values) - 2);
  const max = Math.ceil(Math.max(...values) + 2);

  return (
    <div>
      <p
        className="mb-2 inline-block border px-3 py-1 text-xs font-semibold tabular-nums"
        style={{ borderColor: "var(--card-border)", background: "var(--page-bg)", color: "var(--text-primary)" }}
        data-testid="mape-badge"
      >
        {t("backtestMape")
          .replace("{alignment}", backtest.alignment.toFixed(2))
          .replace("{mape}", backtest.mape.toFixed(2))}
      </p>
      <div className="h-72 w-full" role="img" aria-label={t("backtestTitle")}>
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
              formatter={(value: number, name: string) => [value.toFixed(2), name]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="dgca_reference"
              name={t("legendDgcaBaseline")}
              stroke={pal.secondary}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="apix"
              name={t("legendApixCalculated")}
              stroke={pal.primary}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
        {lang === "hi"
          ? "MAPE = गणना किए गए दैनिक सूचकांक और DGCA मासिक बेसलाइन संदर्भ के बीच औसत निरपेक्ष प्रतिशत त्रुटि।"
          : "MAPE = mean absolute percentage error between the calculated daily index and the DGCA monthly baseline reference."}
      </p>
    </div>
  );
}
