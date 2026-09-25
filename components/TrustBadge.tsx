"use client";

import { Database, Radio, RefreshCw } from "lucide-react";
import type { DashboardData } from "@/lib/queries";
import { useLanguage } from "@/lib/language";

export default function TrustBadge({ provenance, baseDate, corridors }: { provenance: DashboardData["provenance"]; baseDate: string; corridors: number }) {
  const { t, lang } = useLanguage();
  const isLive = provenance.liveRows > 0;
  const sourceLabel = isLive ? t("dataSourceLive") : t("dataSourceHist");

  const capture = provenance.latestCapture ? new Date(provenance.latestCapture) : null;
  const freshness = capture
    ? capture.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }) + " IST"
    : "—";

  return (
    <div className="civic-card p-4" data-testid="data-trust-badge">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {isLive ? (
            <Radio className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--positive)" }} aria-hidden />
          ) : (
            <Database className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--accent)" }} aria-hidden />
          )}
          <div>
            <h2 className="text-sm font-semibold">
              {isLive ? t("provenanceLive") : t("provenanceHistorical")}
            </h2>
            <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
              {sourceLabel}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
          <div>
            <dt className="font-medium" style={{ color: "var(--text-secondary)" }}>
              {t("totalQuotes")}
            </dt>
            <dd className="font-semibold tabular-nums">{provenance.totalQuotes.toLocaleString("en-IN")}</dd>
          </div>
          <div>
            <dt className="font-medium" style={{ color: "var(--text-secondary)" }}>
              {t("latestCapture")}
            </dt>
            <dd className="font-semibold tabular-nums">
              <span className="inline-flex items-center gap-1">
                <RefreshCw className="h-3 w-3" aria-hidden />
                {freshness}
              </span>
            </dd>
          </div>
          <div>
            <dt className="font-medium" style={{ color: "var(--text-secondary)" }}>
              {t("liveRows")}
            </dt>
            <dd className="font-semibold tabular-nums">{provenance.liveRows.toLocaleString("en-IN")}</dd>
          </div>
          <div>
            <dt className="font-medium" style={{ color: "var(--text-secondary)" }}>
              {t("basePeriod")}
            </dt>
            <dd className="font-semibold tabular-nums">
              {baseDate} = 100.00 · {corridors} {t("routesWord")}
            </dd>
          </div>
        </dl>
      </div>
      {provenance.sourceCounts.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t pt-2 text-xs" style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}>
          {provenance.sourceCounts.map((s) => (
            <li key={s.source}>
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{s.source}</span>:{" "}
              {s.count.toLocaleString("en-IN")} {t("rowsWord")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
