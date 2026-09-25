"use client";

import { useState } from "react";
import { Activity, BarChart2, Calculator, ShieldCheck, Sliders } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Sidebar from "@/components/Sidebar";
import HeroMetricCards from "@/components/HeroMetricCards";
import GeospatialMap from "@/components/GeospatialMap";
import PolicyCopilot from "@/components/PolicyCopilot";
import SiteFooter from "@/components/SiteFooter";

import PageIntro from "@/components/PageIntro";
import TrustBadge from "@/components/TrustBadge";
import IndexTrendChart from "@/components/IndexTrendChart";
import BacktestChart from "@/components/BacktestChart";
import ElasticityChart from "@/components/ElasticityChart";
import SectorHeatmap from "@/components/SectorHeatmap";
import ChartSection from "@/components/ChartSection";
import EconometricLab from "@/components/EconometricLab";
import CorridorDeepDive from "@/components/CorridorDeepDive";
import PolicySimulator from "@/components/PolicySimulator";
import DataTrustConsole from "@/components/DataTrustConsole";
import ForecastView from "@/components/ForecastView";
import AnomaliesView from "@/components/AnomaliesView";

import { i18n } from "@/lib/i18n";
import type { DashboardData } from "@/lib/queries";
import { useLanguage } from "@/lib/language";

type TabId = "overview" | "lab" | "corridor" | "simulator" | "trust";

export default function DashboardClient({ data }: { data: DashboardData }) {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<string>("home");
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs: { id: TabId; labelKey: keyof typeof i18n.en; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }[] = [
    { id: "overview", labelKey: "tabOverview", icon: Activity },
    { id: "lab", labelKey: "tabLab", icon: Calculator },
    { id: "corridor", labelKey: "tabCorridor", icon: BarChart2 },
    { id: "simulator", labelKey: "tabSimulator", icon: Sliders },
    { id: "trust", labelKey: "tabTrust", icon: ShieldCheck },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900" style={{ background: "var(--page-bg)", color: "var(--text-primary)" }}>
      {/* 1. Persistent Top Utility Header */}
      <SiteHeader />

      {/* 2. Main Shell Layout: Sidebar + Canvas Content */}
      <div className="flex flex-1">
        {/* Dark Enterprise Sidebar */}
        <Sidebar activeView={activeView} onSelectView={setActiveView} />

        {/* Dynamic Canvas Container */}
        <main id="main-content" className="flex-1 px-4 py-6 md:px-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* View: Home */}
            {activeView === "home" && (
              <div className="space-y-6">
                <PageIntro />
                <HeroMetricCards data={data} />
                <GeospatialMap heatmap={data.heatmap} />
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <ChartSection id="trend-heading" titleKey="chartIndexTrendTitle" descKey="chartIndexTrendDesc" date={data.baseDate}>
                    <IndexTrendChart series={data.indexSeries} />
                  </ChartSection>
                  <ChartSection id="backtest-heading" titleKey="backtestTitle" descKey="backtestDesc">
                    <BacktestChart backtest={data.backtest} />
                  </ChartSection>
                </div>
              </div>
            )}

            {/* View: Executive Dashboard */}
            {activeView === "dashboard" && (
              <div className="space-y-6">
                <PageIntro />
                <TrustBadge provenance={data.provenance} baseDate={data.baseDate} corridors={data.corridors} />
                <HeroMetricCards data={data} />

                {/* 5-Tab Command Center Navigation Bar */}
                <nav aria-label={t("commandModules")} className="civic-card p-1.5" style={{ background: "var(--page-bg)" }}>
                  <ul className="flex flex-wrap items-center gap-1" role="tablist">
                    {tabs.map((tab) => {
                      const isActive = activeTab === tab.id;
                      const Icon = tab.icon;
                      return (
                        <li key={tab.id} role="presentation" className="flex-1 min-w-[160px]">
                          <button
                            type="button"
                            role="tab"
                            id={`tab-${tab.id}`}
                            aria-selected={isActive}
                            aria-controls={`panel-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex w-full items-center justify-center gap-2 border px-3 py-2 text-xs font-bold transition-none"
                            style={{
                              background: isActive ? "var(--accent)" : "var(--card-bg)",
                              color: isActive ? "var(--header-text)" : "var(--text-primary)",
                              borderColor: isActive ? "var(--accent)" : "var(--card-border)",
                            }}
                          >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden />
                            <span>{t(tab.labelKey as any)}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {activeTab === "overview" && (
                  <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className="space-y-6">
                    <ChartSection id="trend-heading" titleKey="chartIndexTrendTitle" descKey="chartIndexTrendDesc" date={data.baseDate}>
                      <IndexTrendChart series={data.indexSeries} />
                    </ChartSection>
                    <ChartSection id="backtest-heading" titleKey="backtestTitle" descKey="backtestDesc">
                      <BacktestChart backtest={data.backtest} />
                    </ChartSection>
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                      <ChartSection id="elasticity-heading" titleKey="chartElasticityTitle" descKey="chartElasticityDesc">
                        <ElasticityChart elasticity={data.elasticity} />
                      </ChartSection>
                      <ChartSection id="heatmap-heading" titleKey="heatmapTitle" descKey="heatmapDesc" date={data.latestDate}>
                        <SectorHeatmap heatmap={data.heatmap} />
                      </ChartSection>
                    </div>
                  </div>
                )}
                {activeTab === "lab" && <EconometricLab series={data.indexSeries} />}
                {activeTab === "corridor" && <CorridorDeepDive carrierQuotes={data.carrierQuotes} heatmap={data.heatmap} />}
                {activeTab === "simulator" && <PolicySimulator baseIndex={data.indexLatest} />}
                {activeTab === "trust" && <DataTrustConsole provenance={data.provenance} />}
              </div>
            )}

            {/* View: Airfare Index / Econometric Lab */}
            {activeView === "index" && <EconometricLab series={data.indexSeries} />}

            {/* View: Corridor Market Table */}
            {activeView === "routes" && (
              <ChartSection id="heatmap-heading" titleKey="heatmapTitle" descKey="heatmapDesc" date={data.latestDate}>
                <SectorHeatmap heatmap={data.heatmap} />
              </ChartSection>
            )}

            {/* View: Airline Tax Breakdown */}
            {activeView === "airlines" && (
              <CorridorDeepDive carrierQuotes={data.carrierQuotes} heatmap={data.heatmap} />
            )}

            {/* View: Booking Horizons */}
            {activeView === "windows" && (
              <ChartSection id="elasticity-heading" titleKey="chartElasticityTitle" descKey="chartElasticityDesc">
                <ElasticityChart elasticity={data.elasticity} />
              </ChartSection>
            )}

            {/* View: Spatial Heatmap */}
            {activeView === "heatmap" && <GeospatialMap heatmap={data.heatmap} />}

            {/* View: 14-Day ML Forecast */}
            {activeView === "forecast" && <ForecastView data={data} />}

            {/* View: Anomalies & Price Cap Breaches */}
            {activeView === "anomalies" && <AnomaliesView data={data} />}

            {/* View: Policy Simulator */}
            {activeView === "simulator" && <PolicySimulator baseIndex={data.indexLatest} />}

            {/* View: Data Trust Console */}
            {activeView === "trust" && <DataTrustConsole provenance={data.provenance} />}
          </div>
        </main>
      </div>

      <PolicyCopilot />

      {/* 4. Institutional Footer */}
      <SiteFooter />
    </div>
  );
}
