"use client";

import { useState } from "react";
import { AlertOctagon, AlertTriangle, CheckCircle2, Sliders } from "lucide-react";
import { useLanguage } from "@/lib/language";

export default function PolicySimulator({ baseIndex }: { baseIndex: number }) {
  const { t, lang } = useLanguage();

  // Slider States
  // ATF Price Shock: -20% to +30% (default: 0)
  const [atfShock, setAtfShock] = useState<number>(0);
  // Capacity Disruption: -40% to 0% (default: 0)
  const [capacityShock, setCapacityShock] = useState<number>(0);
  // Dynamic Surge Cap Multiplier: 1.0x to 2.5x (default: 1.0)
  const [surgeCap, setSurgeCap] = useState<number>(1.0);

  // Computations
  // ATF_Shock & Capacity_Shock in decimal (e.g. +10% -> 0.10, -20% -> -0.20)
  const atfDec = atfShock / 100;
  const capDec = capacityShock / 100;

  const simulatedIndex = Math.round(
    baseIndex * (1 + 0.35 * atfDec - 0.25 * capDec) * surgeCap * 100
  ) / 100;

  const deltaIndex = Math.round((simulatedIndex - baseIndex) * 100) / 100;
  // \Delta CPI_{transport} = \Delta Index \times 0.075 bps
  const cpiImpactBps = Math.round(deltaIndex * 0.075 * 100) / 100;

  let riskTier: "stable" | "moderate" | "critical";
  if (Math.abs(cpiImpactBps) < 10.0) {
    riskTier = "stable";
  } else if (Math.abs(cpiImpactBps) <= 25.0) {
    riskTier = "moderate";
  } else {
    riskTier = "critical";
  }

  const resetSliders = () => {
    setAtfShock(0);
    setCapacityShock(0);
    setSurgeCap(1.0);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="civic-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3" style={{ borderColor: "var(--card-border)" }}>
          <div className="flex items-center gap-2.5">
            <Sliders className="h-5 w-5" style={{ color: "var(--accent)" }} aria-hidden />
            <div>
              <h2 className="text-base font-bold">{t("simTitle")}</h2>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Client-side macroeconomic scenario analysis for RBI Monetary Policy & MoCA analysts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetSliders}
            className="border px-3 py-1 text-xs font-semibold uppercase tracking-wide hover:bg-slate-100"
            style={{ borderColor: "var(--card-border)", color: "var(--text-primary)" }}
          >
            {lang === "hi" ? "रीसेट करें" : "Reset Parameters"}
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Slider 1: ATF Price Shock */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <label htmlFor="atf-shock-slider" style={{ color: "var(--text-primary)" }}>
                {t("fuelShock")}
              </label>
              <span className="font-mono text-sm font-bold" style={{ color: "var(--accent)" }}>
                {atfShock > 0 ? `+${atfShock}` : atfShock}%
              </span>
            </div>
            <input
              id="atf-shock-slider"
              type="range"
              min="-20"
              max="30"
              step="1"
              value={atfShock}
              onChange={(e) => setAtfShock(Number(e.target.value))}
              className="h-2 w-full cursor-pointer rounded-lg bg-slate-200 accent-ashoka-navy"
            />
            <div className="flex justify-between text-[10px]" style={{ color: "var(--text-secondary)" }}>
              <span>-20% (Softening)</span>
              <span>0%</span>
              <span>+30% (Spike)</span>
            </div>
          </div>

          {/* Slider 2: Capacity Disruption */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <label htmlFor="capacity-shock-slider" style={{ color: "var(--text-primary)" }}>
                {t("capacityShock")}
              </label>
              <span className="font-mono text-sm font-bold" style={{ color: "var(--accent)" }}>
                {capacityShock}%
              </span>
            </div>
            <input
              id="capacity-shock-slider"
              type="range"
              min="-40"
              max="0"
              step="1"
              value={capacityShock}
              onChange={(e) => setCapacityShock(Number(e.target.value))}
              className="h-2 w-full cursor-pointer rounded-lg bg-slate-200 accent-ashoka-navy"
            />
            <div className="flex justify-between text-[10px]" style={{ color: "var(--text-secondary)" }}>
              <span>-40% (Groundings)</span>
              <span>-20%</span>
              <span>0% (Full Ops)</span>
            </div>
          </div>

          {/* Slider 3: Dynamic Surge Cap Multiplier */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <label htmlFor="surge-cap-slider" style={{ color: "var(--text-primary)" }}>
                {t("surgeMultiplier")}
              </label>
              <span className="font-mono text-sm font-bold" style={{ color: "var(--accent)" }}>
                {surgeCap.toFixed(2)}x
              </span>
            </div>
            <input
              id="surge-cap-slider"
              type="range"
              min="1.0"
              max="2.5"
              step="0.05"
              value={surgeCap}
              onChange={(e) => setSurgeCap(Number(e.target.value))}
              className="h-2 w-full cursor-pointer rounded-lg bg-slate-200 accent-ashoka-navy"
            />
            <div className="flex justify-between text-[10px]" style={{ color: "var(--text-secondary)" }}>
              <span>1.0x (Standard)</span>
              <span>1.75x</span>
              <span>2.5x (Uncapped)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Results & Alert Tile */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Metric Card 1: Base vs Simulated Index */}
        <div className="civic-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
            Current Baseline Index
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{baseIndex.toFixed(2)}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            Base Month Reference (100.00)
          </p>
        </div>

        {/* Metric Card 2: Simulated Index Delta */}
        <div className="civic-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
            Projected APIx Index
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {simulatedIndex.toFixed(2)}{" "}
            <span className="text-sm font-semibold" style={{ color: deltaIndex >= 0 ? "var(--alert)" : "var(--positive)" }}>
              ({deltaIndex >= 0 ? "+" : ""}{deltaIndex.toFixed(2)} pts)
            </span>
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            Under simulated macro shocks
          </p>
        </div>

        {/* Metric Card 3: CPI Transport Transmission */}
        <div className="civic-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
            {t("cpiImpact")}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums" style={{ color: riskTier === "critical" ? "var(--alert)" : "var(--text-primary)" }}>
            {cpiImpactBps >= 0 ? "+" : ""}{cpiImpactBps.toFixed(2)} <span className="text-lg">bps</span>
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            Transmission: ΔIndex × 0.075 bps
          </p>
        </div>
      </div>

      {/* Macro Risk Banner */}
      <div
        className="civic-card p-4"
        style={{
          borderColor:
            riskTier === "critical" ? "var(--alert)" : riskTier === "moderate" ? "var(--focus-ring)" : "var(--positive)",
        }}
      >
        <div className="flex items-start gap-3">
          {riskTier === "critical" ? (
            <AlertOctagon className="mt-0.5 h-6 w-6 shrink-0" style={{ color: "var(--alert)" }} aria-hidden />
          ) : riskTier === "moderate" ? (
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0" style={{ color: "var(--focus-ring)" }} aria-hidden />
          ) : (
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" style={{ color: "var(--positive)" }} aria-hidden />
          )}
          <div>
            <h3 className="text-sm font-bold">
              {riskTier === "critical"
                ? t("riskCritical")
                : riskTier === "moderate"
                ? t("riskModerate")
                : t("riskStable")}
            </h3>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {riskTier === "critical"
                ? "Simulated supply-side aviation shocks indicate critical transport inflation transmission exceeding 25 basis points. Monetary policy alert recommended for RBI MPC review."
                : riskTier === "moderate"
                ? "Moderate inflation shift detected. Airfare price elasticity is transmitting 10-25 basis points of momentum into the transport CPI sub-index."
                : "Airfare pricing dynamics remain within stable macroeconomic bounds with sub-10 basis point transport CPI transmission."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
