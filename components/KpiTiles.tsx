"use client";

import { Activity, AlertTriangle, CheckCircle2, IndianRupee, Route, TrendingDown, TrendingUp } from "lucide-react";
import type { DashboardData } from "@/lib/queries";
import { useLanguage } from "@/lib/language";

type Props = { data: DashboardData };

function ChangeBadge({ value }: { value: number | null }) {
  const { t } = useLanguage();
  if (value == null) return <span className="text-sm" style={{ color: "var(--text-secondary)" }}>—</span>;
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  const color = up ? "var(--alert)" : "var(--positive)";
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color }}>
      <Icon className="h-4 w-4" aria-hidden />
      {up ? "+" : ""}
      {value.toFixed(2)} {t("ptsWord")}
    </span>
  );
}

export default function KpiTiles({ data }: Props) {
  const { t, lang } = useLanguage();
  const fmt = (v: number, d = 2) => v.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

  const tiles = [
    {
      icon: Activity,
      title: t("kpiIndexTitle"),
      sub: `${t("kpiIndexSub")} • ${t("chartIndexTrendTitle") === "" ? "" : data.baseDate}`,
      value: fmt(data.indexLatest),
      extra: (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <ChangeBadge value={data.change24h} />
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>7d:</span>
          <ChangeBadge value={data.change7d} />
        </div>
      ),
    },
    {
      icon: Route,
      title: t("kpiRoutesTitle"),
      sub: t("kpiRoutesSub"),
      value: String(data.corridors),
      extra: (
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          DEL ⇄ BOM · BLR ⇄ DEL · BOM ⇄ BLR · DEL ⇄ CCU · MAA ⇄ DEL
        </span>
      ),
    },
    {
      icon: IndianRupee,
      title: t("kpiMedianTitle"),
      sub: t("kpiMedianSub"),
      value: data.medianFareT7 != null ? `₹ ${fmt(data.medianFareT7, 0)}` : "—",
      extra: (
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {t("observationDate").replace("{date}", data.latestDate)}
        </span>
      ),
    },
    {
      icon: data.surgeAlerts.length ? AlertTriangle : CheckCircle2,
      title: t("kpiSurgeTitle"),
      sub: t("kpiSurgeSub"),
      value: String(data.surgeAlerts.length),
      extra: data.surgeAlerts.length ? (
        <ul className="space-y-0.5">
          {data.surgeAlerts.map((a) => (
            <li key={a.route_code} className="text-xs font-semibold" style={{ color: "var(--alert)" }}>
              {a.route_code}: z = {a.z.toFixed(2)}σ
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-xs" style={{ color: "var(--positive)" }}>
          {t("noSurge")}
        </span>
      ),
    },
  ];

  return (
    <section aria-label={t("kpiIndexTitle")} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.title} className="civic-card flex flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-sm font-semibold leading-snug">{tile.title}</h2>
            <tile.icon className="h-5 w-5 shrink-0" style={{ color: "var(--accent)" }} aria-hidden />
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            {tile.sub}
          </p>
          <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight">{tile.value}</p>
          <div className="mt-2">{tile.extra}</div>
        </div>
      ))}
    </section>
  );
}
