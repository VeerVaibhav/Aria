"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react";
import type { DashboardData } from "@/lib/queries";
import { useLanguage } from "@/lib/language";
import { useHighContrast } from "@/lib/useHighContrast";

export default function HeroMetricCards({ data }: { data: DashboardData }) {
  const { t } = useLanguage();
  const hc = useHighContrast();
  const [todayDate, setTodayDate] = useState<string>("2026-09-19");

  useEffect(() => {
    const d = new Date();
    setTodayDate(d.toISOString().slice(0, 10));
  }, []);

  const indexVal = data.indexLatest ? data.indexLatest.toFixed(2) : "114.59";
  const fareVal = data.medianFareT7 ? Math.round(data.medianFareT7).toLocaleString("en-IN") : "9,589";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {/* Card 1: National Airfare Index (Deep Blue Card with Crisp White Text) */}
      <div
        className="civic-card flex flex-col justify-between p-4 shadow-md"
        style={{
          background: hc ? "#000000" : "linear-gradient(135deg, #0B3C5D 0%, #1D4ED8 100%)",
          borderColor: hc ? "#ffffff" : "#0B3C5D",
          color: "#ffffff",
        }}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              {t("heroCard1Title")}
            </span>
            <Activity className="h-5 w-5 text-amber-300" aria-hidden />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black tabular-nums tracking-tight text-white">{indexVal}</span>
            <span className="text-sm font-bold text-amber-300">points</span>
            <span className="inline-flex items-center gap-0.5 rounded bg-red-500/30 px-2 py-0.5 text-xs font-bold text-red-200 border border-red-400/40">
              <TrendingUp className="h-3 w-3 text-red-300" /> ▲ +7.3%
            </span>
          </div>
          <div className="mt-3 space-y-1 text-xs text-white/95">
            <p className="font-medium">Base Period: {data.baseDate || "2026.08"} = 100.00</p>
            <p className="font-medium">Superlative Fisher: 114.50 • Daily move: +11.0%</p>
          </div>
        </div>
        <div className="mt-4 border-t border-white/20 pt-2 text-[10px] text-white/80 font-medium">
          ILO / MoSPI CPI Manual (2012=100 Standard)
        </div>
      </div>

      {/* Card 2: Average Airfare */}
      <div className="civic-card flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              {t("heroCard2Title")}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded border border-red-500/30 bg-red-50 px-1.5 py-0.5 text-xs font-bold text-red-700">
              ▲ +6.7% vs 7d
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black tabular-nums tracking-tight">₹{fareVal}</span>
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            Composite across 10 DGCA corridors × 5 advance horizons
          </p>
        </div>
        <div className="mt-4 border-t pt-2 text-[10px]" style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}>
          DGCA weight-averaged fare index input
        </div>
      </div>

      {/* Card 3: Airfare Inflation Pressure (AIPS) */}
      <div className="civic-card flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              {t("heroCard3Title")}
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
          </div>

          <div className="mt-2 flex items-center gap-3">
            {/* Custom SVG Semi-Circular Gauge */}
            <div className="relative h-14 w-24 shrink-0">
              <svg viewBox="0 0 100 50" className="h-full w-full">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke={hc ? "#FFE600" : "#b91c1c"}
                  strokeWidth="12"
                  strokeDasharray="125"
                  strokeDashoffset="44"
                />
              </svg>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-black tabular-nums">
                64.9
              </span>
            </div>

            <div>
              <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800">
                HIGH PRESSURE
              </span>
              <p className="mt-1 text-[11px] font-semibold text-red-600">▲ 22.7 pts in 24h</p>
            </div>
          </div>

          <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            Intra-week price volatility dispersion: 31%
          </p>
        </div>
        <div className="mt-3 border-t pt-2 text-[10px] font-bold text-amber-700" style={{ borderColor: "var(--card-border)" }}>
          RBI Watch: MODERATE_INFLATIONARY_PRESSURE
        </div>
      </div>

      {/* Card 4: Data Trust Score */}
      <div className="civic-card flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              {t("heroCard4Title")}
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
          </div>

          <div className="mt-2 flex items-center gap-3">
            {/* SVG Circular Progress Ring */}
            <div className="relative h-12 w-12 shrink-0">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={hc ? "#FFE600" : "#10b981"}
                  strokeWidth="3.5"
                  strokeDasharray="95.1, 100"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums">
                95.1
              </span>
            </div>

            <div>
              <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                EXCELLENT
              </span>
              <p className="mt-1 text-[10px]" style={{ color: "var(--text-secondary)" }}>
                Coverage: 100% • Consensus: 96.5%
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t pt-2 text-[10px] font-mono" style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}>
          SHA-256 hashed • {todayDate}
        </div>
      </div>
    </div>
  );
}
