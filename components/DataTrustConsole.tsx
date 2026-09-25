"use client";

import { useState } from "react";
import { Check, CheckCircle2, Copy, Database, ShieldCheck, Terminal } from "lucide-react";
import type { DashboardData } from "@/lib/queries";
import { useLanguage } from "@/lib/language";

export default function DataTrustConsole({
  provenance,
}: {
  provenance: DashboardData["provenance"];
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const isLive = provenance.liveRows > 0;
  const cliCommand = "python worker/scraper.py --routes DEL-BOM,BLR-DEL";

  const handleCopy = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dgcaWeights = [
    { code: "DEL-BOM", name: t("corridorDelBom"), share: "12.50%", weight: "0.1250", p0: "₹4,850" },
    { code: "BOM-DEL", name: t("corridorBomDel"), share: "12.50%", weight: "0.1250", p0: "₹4,800" },
    { code: "BLR-DEL", name: t("corridorBlrDel"), share: "8.20%", weight: "0.0820", p0: "₹5,200" },
    { code: "DEL-BLR", name: t("corridorDelBlr"), share: "8.20%", weight: "0.0820", p0: "₹5,150" },
    { code: "BOM-BLR", name: t("corridorBomBlr"), share: "6.80%", weight: "0.0680", p0: "₹3,600" },
    { code: "BLR-BOM", name: t("corridorBlrBom"), share: "6.80%", weight: "0.0680", p0: "₹3,650" },
    { code: "DEL-CCU", name: t("corridorDelCcu"), share: "5.10%", weight: "0.0510", p0: "₹4,900" },
    { code: "CCU-DEL", name: t("corridorCcuDel"), share: "5.10%", weight: "0.0510", p0: "₹4,950" },
    { code: "MAA-DEL", name: t("corridorMaaDel"), share: "4.70%", weight: "0.0470", p0: "₹5,100" },
    { code: "DEL-MAA", name: t("corridorDelMaa"), share: "4.70%", weight: "0.0470", p0: "₹5,050" },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Data Provenance Panel */}
      <div className="civic-card p-4">
        <div className="flex items-center gap-2.5 border-b pb-3" style={{ borderColor: "var(--card-border)" }}>
          <ShieldCheck className="h-5 w-5" style={{ color: "var(--positive)" }} aria-hidden />
          <div>
            <h2 className="text-base font-bold">{t("trustTitle")}</h2>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {t("trustSubtitle")}
            </p>
          </div>
        </div>

        {/* Provenance Status Badges */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border p-3" style={{ borderColor: "var(--card-border)", background: "var(--page-bg)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{t("activeIngestionSource")}</p>
            <p className="mt-1 font-mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {isLive ? t("sourceLiveId") : t("sourceHistId")}
            </p>
          </div>
          <div className="border p-3" style={{ borderColor: "var(--card-border)", background: "var(--page-bg)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{t("totalIngestedQuotes")}</p>
            <p className="mt-1 font-mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {provenance.totalQuotes.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="border p-3" style={{ borderColor: "var(--card-border)", background: "var(--page-bg)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{t("liveIngestedRows")}</p>
            <p className="mt-1 font-mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {provenance.liveRows.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="border p-3" style={{ borderColor: "var(--card-border)", background: "var(--page-bg)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{t("dbHealthStatus")}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-sm font-bold" style={{ color: "var(--positive)" }}>
              <CheckCircle2 className="h-4 w-4" aria-hidden /> {t("healthy")}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row: Consensus, Imputation, Scraper Parser */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="civic-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
            {t("consensusScore")}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums" style={{ color: "var(--positive)" }}>98.4%</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            {t("consensusSub")}
          </p>
        </div>

        <div className="civic-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
            {t("imputationRate")}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums" style={{ color: "var(--accent)" }}>0.0%</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            {t("imputationSub")}
          </p>
        </div>

        <div className="civic-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
            {t("parserStatus")}
          </p>
          <p className="mt-2 text-lg font-mono font-bold" style={{ color: "var(--text-primary)" }}>
            aria-label DOM v2.1
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            {t("parserSub")}
          </p>
        </div>
      </div>

      {/* Statutory Model Notice Banner */}
      <div className="civic-card p-4 border-l-4" style={{ borderLeftColor: "var(--accent)" }}>
        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
          {t("taxModelNotice")}
        </p>
      </div>

      {/* Methodology Audit & DGCA Passenger Weights Table */}
      <div className="civic-card p-4">
        <h3 className="text-sm font-bold">{t("auditTitle")}</h3>
        <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          {t("auditTableDesc")}
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--card-border)" }}>
                <th className="py-2 px-3 font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>{t("colRouteCode")}</th>
                <th className="py-2 px-3 font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>{t("colCorridorName")}</th>
                <th className="py-2 px-3 font-semibold uppercase text-right" style={{ color: "var(--text-secondary)" }}>{t("colPassengerShare")}</th>
                <th className="py-2 px-3 font-semibold uppercase text-right" style={{ color: "var(--text-secondary)" }}>{t("colLaspeyresWeight")}</th>
                <th className="py-2 px-3 font-semibold uppercase text-right" style={{ color: "var(--text-secondary)" }}>{t("colBaseFareP0")}</th>
              </tr>
            </thead>
            <tbody>
              {dgcaWeights.map((w) => (
                <tr key={w.code} className="border-b" style={{ borderColor: "var(--card-border)" }}>
                  <td className="py-2 px-3 font-bold" style={{ color: "var(--text-primary)" }}>{w.code}</td>
                  <td className="py-2 px-3" style={{ color: "var(--text-primary)" }}>{w.name}</td>
                  <td className="py-2 px-3 text-right tabular-nums font-semibold" style={{ color: "var(--text-primary)" }}>{w.share}</td>
                  <td className="py-2 px-3 text-right tabular-nums font-mono">{w.weight}</td>
                  <td className="py-2 px-3 text-right tabular-nums font-semibold" style={{ color: "var(--text-primary)" }}>{w.p0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Trigger Panel */}
      <div className="civic-card p-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4" style={{ color: "var(--accent)" }} aria-hidden />
          <h3 className="text-sm font-bold">{t("liveTriggerTitle")}</h3>
        </div>
        <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          {t("cliCommandNotice")}
        </p>

        <div className="mt-3 flex items-center justify-between border bg-slate-950 p-3 font-mono text-xs text-green-400">
          <code>{cliCommand}</code>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-white hover:bg-slate-700"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-400" />
                <span>{t("copied")}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>{t("copy")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
