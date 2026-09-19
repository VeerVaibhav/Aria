"use client";

import {
  Activity,
  AlertTriangle,
  BarChart2,
  Bot,
  Building2,
  Calculator,
  Calendar,
  Compass,
  Home,
  MapPin,
  ShieldCheck,
  Sliders,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/lib/language";

type Props = {
  activeView: string;
  onSelectView: (view: string) => void;
  onOpenCopilot: () => void;
};

export default function Sidebar({ activeView, onSelectView, onOpenCopilot }: Props) {
  const { t } = useLanguage();

  const navSections = [
    {
      headerKey: "navOverviewHeader",
      items: [
        { id: "home", labelKey: "navHome", icon: Home },
        { id: "dashboard", labelKey: "navDashboard", icon: Activity },
      ],
    },
    {
      headerKey: "navIntelligenceHeader",
      items: [
        { id: "index", labelKey: "navIndex", icon: Calculator },
        { id: "routes", labelKey: "navRoutes", icon: Compass },
        { id: "airlines", labelKey: "navAirlines", icon: Building2 },
        { id: "windows", labelKey: "navWindows", icon: Calendar },
        { id: "heatmap", labelKey: "navHeatmap", icon: MapPin },
      ],
    },
    {
      headerKey: "navAnalyticsHeader",
      items: [
        { id: "forecast", labelKey: "navForecast", icon: TrendingUp },
        { id: "anomalies", labelKey: "navAnomalies", icon: AlertTriangle },
        { id: "simulator", labelKey: "navSimulator", icon: Sliders },
        { id: "trust", labelKey: "navTrust", icon: ShieldCheck },
        { id: "copilot", labelKey: "navCopilot", icon: Bot, isAction: true },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
      <div className="flex h-full flex-col justify-between p-3">
        <div className="space-y-6">
          {navSections.map((section) => (
            <div key={section.headerKey}>
              <h2 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                {t(section.headerKey as any)}
              </h2>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.isAction) {
                            onOpenCopilot();
                          } else {
                            onSelectView(item.id);
                          }
                        }}
                        className={`flex w-full items-center justify-between px-3 py-2 text-xs font-semibold transition-none border ${
                          isActive
                            ? "bg-ashoka-navy text-white border-ashoka-navy"
                            : item.isAction
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20"
                            : "border-transparent text-slate-700 hover:bg-slate-100"
                        }`}
                        style={
                          isActive
                            ? { background: "var(--accent)", color: "var(--header-text)", borderColor: "var(--accent)" }
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 shrink-0" aria-hidden />
                          <span>{t(item.labelKey as any)}</span>
                        </div>
                        {item.isAction && (
                          <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-slate-950">
                            AI
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Institutional Footer info */}
        <div className="border-t pt-3 text-[10px]" style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}>
          <p className="font-bold uppercase" style={{ color: "var(--text-primary)" }}>
            MoSPI APIx System v2.4
          </p>
          <p className="mt-0.5">DGCA Corridors • ILO Standard</p>
        </div>
      </div>
    </aside>
  );
}
