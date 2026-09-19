"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { IndexPoint } from "@/lib/queries";
import { useLanguage } from "@/lib/language";
import { chartPalette, useHighContrast } from "@/lib/useHighContrast";

export default function IndexTrendChart({ series }: { series: IndexPoint[] }) {
  const { t } = useLanguage();
  const pal = chartPalette(useHighContrast());
  const data = series.map((p) => ({
    date: p.quote_date.slice(5),
    apix: p.apix_index_value,
  }));
  const values = series.map((p) => p.apix_index_value);
  const pad = 3;
  const min = Math.floor(Math.min(...values, 100) - pad);
  const max = Math.ceil(Math.max(...values, 100) + pad);

  return (
    <div className="h-72 w-full" role="img" aria-label={t("chartIndexTrendTitle")}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: pal.tick }} tickLine={false} interval="preserveStartEnd" />
          <YAxis domain={[min, max]} tick={{ fontSize: 11, fill: pal.tick }} tickLine={false} width={44} />
          <Tooltip
            contentStyle={{ border: "1px solid #cbd5e1", borderRadius: 2, fontSize: 12 }}
            formatter={(value: number) => [value.toFixed(2), "APIx"]}
          />
          <ReferenceLine y={100} stroke={pal.dashedRef} strokeDasharray="4 4" label={{ value: t("chartBaseLabel"), fontSize: 10, fill: pal.tick, position: "insideBottomRight" }} />
          <Line type="monotone" dataKey="apix" stroke={pal.primary} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
