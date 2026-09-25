"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, MapPin, Plane } from "lucide-react";
import type { DashboardData } from "@/lib/queries";
import { useLanguage } from "@/lib/language";
import { useHighContrast } from "@/lib/useHighContrast";

type Hub = { code: string; name: string; x: number; y: number };

const HUBS: Record<string, Hub> = {
  DEL: { code: "DEL", name: "New Delhi (DEL)", x: 196, y: 196 },
  BOM: { code: "BOM", name: "Mumbai (BOM)", x: 119, y: 390 },
  BLR: { code: "BLR", name: "Bengaluru (BLR)", x: 205, y: 515 },
  CCU: { code: "CCU", name: "Kolkata (CCU)", x: 403, y: 319 },
  MAA: { code: "MAA", name: "Chennai (MAA)", x: 254, y: 515 },
  HYD: { code: "HYD", name: "Hyderabad (HYD)", x: 221, y: 425 },
  PNQ: { code: "PNQ", name: "Pune (PNQ)", x: 137, y: 403 },
  GOI: { code: "GOI", name: "Goa (GOI)", x: 135, y: 466 },
};

type CorridorMapItem = {
  route_code: string;
  from: Hub;
  to: Hub;
  cx: number;
  cy: number;
  fare: number;
  changePct: number;
  carrier: string;
  share: string;
};

export default function GeospatialMap({ heatmap }: { heatmap: DashboardData["heatmap"] }) {
  const { t } = useLanguage();
  const hc = useHighContrast();
  const [hoveredRoute, setHoveredRoute] = useState<CorridorMapItem | null>(null);

  const corridors: CorridorMapItem[] = [
    {
      route_code: "BOM-DEL",
      from: HUBS.BOM,
      to: HUBS.DEL,
      cx: 125,
      cy: 270,
      fare: 6425,
      changePct: 19.9,
      carrier: "IndiGo",
      share: "12.50%",
    },
    {
      route_code: "DEL-BOM",
      from: HUBS.DEL,
      to: HUBS.BOM,
      cx: 190,
      cy: 305,
      fare: 6314,
      changePct: 12.4,
      carrier: "Air India",
      share: "12.50%",
    },
    {
      route_code: "BLR-DEL",
      from: HUBS.BLR,
      to: HUBS.DEL,
      cx: 155,
      cy: 350,
      fare: 8259,
      changePct: 8.5,
      carrier: "Air India Express",
      share: "8.20%",
    },
    {
      route_code: "DEL-BLR",
      from: HUBS.DEL,
      to: HUBS.BLR,
      cx: 260,
      cy: 360,
      fare: 8150,
      changePct: 7.1,
      carrier: "IndiGo",
      share: "8.20%",
    },
    {
      route_code: "BOM-BLR",
      from: HUBS.BOM,
      to: HUBS.BLR,
      cx: 130,
      cy: 460,
      fare: 4850,
      changePct: 11.2,
      carrier: "SpiceJet",
      share: "6.80%",
    },
    {
      route_code: "BLR-BOM",
      from: HUBS.BLR,
      to: HUBS.BOM,
      cx: 185,
      cy: 445,
      fare: 4920,
      changePct: 9.8,
      carrier: "Akasa Air",
      share: "6.80%",
    },
    {
      route_code: "CCU-DEL",
      from: HUBS.CCU,
      to: HUBS.DEL,
      cx: 330,
      cy: 220,
      fare: 5490,
      changePct: -15.7,
      carrier: "IndiGo",
      share: "5.10%",
    },
    {
      route_code: "DEL-CCU",
      from: HUBS.DEL,
      to: HUBS.CCU,
      cx: 280,
      cy: 280,
      fare: 6120,
      changePct: 4.1,
      carrier: "Air India",
      share: "5.10%",
    },
    {
      route_code: "MAA-DEL",
      from: HUBS.MAA,
      to: HUBS.DEL,
      cx: 290,
      cy: 350,
      fare: 7890,
      changePct: 6.2,
      carrier: "IndiGo",
      share: "4.70%",
    },
    {
      route_code: "DEL-MAA",
      from: HUBS.DEL,
      to: HUBS.MAA,
      cx: 195,
      cy: 370,
      fare: 7650,
      changePct: 5.4,
      carrier: "Air India",
      share: "4.70%",
    },
  ];

  const topMovers = [
    { route: t("routeBomDel"), code: "BOM-DEL", pct: 19.9, up: true, fare: "₹6,425" },
    { route: t("routeDelPnq"), code: "DEL-PNQ", pct: 16.4, up: true, fare: "₹7,150" },
    { route: t("routeCcuDel"), code: "CCU-DEL", pct: -15.7, up: false, fare: "₹5,490" },
    { route: t("routeBlrBom"), code: "BOM-BLR", pct: 11.2, up: true, fare: "₹4,850" },
  ];

  const getPathColor = (changePct: number) => {
    if (hc) {
      if (changePct >= 15) return "#FFE600";
      if (changePct >= 5) return "#00E5FF";
      return "#7CFC00";
    }
    if (changePct >= 15) return "#dc2626";
    if (changePct >= 5) return "#d97706";
    return "#16a34a";
  };

  return (
    <div className="civic-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3" style={{ borderColor: "var(--card-border)" }}>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" style={{ color: "var(--accent)" }} aria-hidden />
          <div>
            <h2 className="text-base font-bold">{t("geoMapTitle")}</h2>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {t("geoMapSub")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600"></span> {t("legendHigh")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> {t("legendModerate")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-600"></span> {t("legendStable")}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* SVG Vector Map Canvas */}
        <div className="relative col-span-2 flex items-center justify-center rounded border p-3 shadow-inner" style={{ borderColor: "var(--card-border)", background: hc ? "#000000" : "#f8fafc" }}>
          <svg viewBox="0 0 600 650" className="h-[480px] w-full drop-shadow">
            {/* India outline with official J&K + Ladakh crown (Gilgit–Baltistan, Karakoram, Aksai Chin) */}
            <path
              d="M 168,16
                 L 178,8 L 192,10 L 206,20 L 218,34 L 226,46
                 L 236,44 L 252,42 L 268,48 L 282,58 L 290,72
                 L 288,88 L 276,102 L 260,114 L 246,124
                 L 232,132 L 220,142
                 L 232,150 L 248,154 L 264,160 L 278,170
                 L 288,182 L 298,194 L 310,206 L 324,216 L 340,226 L 352,236
                 L 358.7,239.3 L 367.8,239.3
                 L 377.0,241.3 L 386.2,239.3 L 395.3,239.3 L 399.0,229.1 L 404.5,218.9
                 L 410.0,208.7 L 413.7,218.9 L 422.8,229.1 L 432.0,233.2 L 441.2,233.2
                 L 450.3,229.1 L 459.5,225.0 L 468.7,212.8 L 477.8,208.7 L 487.0,204.6
                 L 496.2,198.5 L 505.3,192.3 L 514.5,188.3 L 523.7,188.3 L 532.8,192.3
                 L 542.0,198.5 L 551.2,204.6 L 560.3,208.7 L 565.8,218.9 L 551.2,229.1
                 L 542.0,239.3 L 532.8,249.5 L 523.7,259.7 L 514.5,269.9 L 505.3,280.1
                 L 496.2,290.3 L 490.7,300.5 L 487.0,310.7 L 483.3,320.9 L 477.8,331.1
                 L 468.7,331.1 L 459.5,320.9 L 454.0,310.7 L 450.3,300.5 L 459.5,290.3
                 L 450.3,280.1 L 441.2,269.9 L 432.0,259.7 L 422.8,249.5 L 413.7,245.4
                 L 410.0,249.5 L 404.5,259.7 L 400.8,269.9 L 395.3,280.1 L 400.8,290.3
                 L 404.5,300.5 L 410.0,310.7 L 413.7,320.9 L 404.5,331.1 L 395.3,335.2
                 L 386.2,341.3 L 377.0,341.3 L 367.8,351.5 L 358.7,361.7 L 349.5,371.9
                 L 340.3,376.0 L 331.2,392.3 L 322.0,402.6 L 312.8,412.8 L 303.7,423.0
                 L 294.5,433.2 L 276.2,443.4 L 267.0,449.5 L 257.8,463.8 L 252.3,484.2
                 L 254.2,504.6 L 252.3,514.8 L 248.7,525.0 L 245.0,545.4 L 239.5,565.8
                 L 234.0,576.0 L 221.2,596.4 L 212.0,606.6 L 202.8,614.8
                 L 193.7,606.6 L 184.5,596.4 L 179.0,586.2 L 175.3,576.0 L 171.7,565.8
                 L 166.2,555.6 L 160.7,545.4 L 157.0,535.2 L 153.3,525.0 L 147.8,504.6
                 L 144.2,494.4 L 138.7,478.1 L 135.0,465.8 L 129.5,453.6 L 125.8,443.4
                 L 120.3,423.0 L 116.7,402.6 L 116.7,392.3 L 118.5,382.1 L 120.3,371.9
                 L 116.7,361.7 L 111.2,351.5 L 105.7,341.3 L 102.0,331.1
                 L 92.8,341.3 L 83.7,347.4 L 74.5,351.5 L 65.3,345.4
                 L 56.2,331.1 L 47.0,325.0 L 37.8,310.7 L 34.2,300.5
                 L 37.8,290.3 L 47.0,280.1 L 56.2,259.7 L 65.3,249.5
                 L 83.7,218.9 L 92.8,208.7 L 102.0,198.5
                 L 108,176 L 120,158 L 128,142
                 L 122,128 L 110,116
                 L 98,102 L 90,86 L 94,70 L 108,52
                 L 124,36 L 144,22 L 158,14 L 168,16 Z"
              fill={hc ? "#111111" : "#dbe4ee"}
              stroke={hc ? "#ffffff" : "#334155"}
              strokeWidth="1.7"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Sub-region Reference Grid Lines */}
            <path d="M 119,390 Q 250,350 403,319" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <path d="M 196,196 Q 230,360 254,515" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

            {/* Curved Flight Bezier Corridors */}
            {corridors.map((c) => {
              const isHovered = hoveredRoute?.route_code === c.route_code;
              const color = getPathColor(c.changePct);
              return (
                <g key={c.route_code}>
                  <path
                    d={`M ${c.from.x} ${c.from.y} Q ${c.cx} ${c.cy} ${c.to.x} ${c.to.y}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHovered ? 4.5 : 2.5}
                    strokeOpacity={isHovered ? 1 : 0.85}
                    strokeLinecap="round"
                    className="cursor-pointer transition-all hover:stroke-width-5"
                    onMouseEnter={() => setHoveredRoute(c)}
                    onMouseLeave={() => setHoveredRoute(null)}
                  />
                </g>
              );
            })}

            {/* Hub Airport Nodes */}
            {Object.values(HUBS).map((hub) => (
              <g key={hub.code} transform={`translate(${hub.x}, ${hub.y})`} className="cursor-pointer">
                <circle r="9" fill="#0B3C5D" opacity="0.25" className="animate-ping" />
                <circle r="5" fill={hc ? "#FFE600" : "#0B3C5D"} stroke="#ffffff" strokeWidth="1.8" />
                <rect x="7" y="-8" width="30" height="14" rx="2" fill={hc ? "#000000" : "#ffffff"} stroke="#cbd5e1" strokeWidth="0.8" />
                <text
                  x="22"
                  y="2"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill={hc ? "#ffffff" : "#0f172a"}
                >
                  {hub.code}
                </text>
              </g>
            ))}
          </svg>

          {/* Dynamic Hover Tooltip Overlay */}
          {hoveredRoute && (
            <div
              className="absolute top-4 left-4 z-20 civic-card p-3 shadow-xl border-l-4"
              style={{
                background: "var(--card-bg)",
                borderLeftColor: getPathColor(hoveredRoute.changePct),
              }}
            >
              <div className="flex items-center gap-1.5 border-b pb-1.5">
                <Plane className="h-4 w-4" style={{ color: "var(--accent)" }} />
                <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                  {hoveredRoute.route_code} {t("corridorWord")}
                </p>
              </div>
              <div className="mt-2 space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                <p>{t("medianFare")}: <span className="font-bold text-slate-900">₹{hoveredRoute.fare.toLocaleString("en-IN")}</span></p>
                <p>{t("day7Movement")}: <span className={hoveredRoute.changePct >= 0 ? "font-bold text-red-600" : "font-bold text-green-600"}>{hoveredRoute.changePct >= 0 ? "+" : ""}{hoveredRoute.changePct}%</span></p>
                <p>{t("topCarrier")}: <span className="font-semibold text-slate-800">{hoveredRoute.carrier}</span></p>
                <p>{t("dgcaTrafficShare")}: <span className="font-mono font-bold text-slate-700">{hoveredRoute.share}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Panel: Top Absolute Movers */}
        <div className="civic-card flex flex-col justify-between p-4" style={{ background: "var(--page-bg)" }}>
          <div>
            <h3 className="text-sm font-bold">{t("topMoversTitle")}</h3>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
              {t("topMoversSub")}
            </p>

            <ul className="mt-4 space-y-3">
              {topMovers.map((item) => (
                <li key={item.code} className="flex items-center justify-between border-b pb-2.5 text-xs" style={{ borderColor: "var(--card-border)" }}>
                  <div>
                    <p className="font-bold">{item.route}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{item.fare} {t("medianFareSuffix")}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 font-bold ${item.up ? "text-red-600" : "text-green-600"}`}>
                    {item.up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {item.up ? "+" : ""}{item.pct}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 border-t pt-2 text-[10px]" style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}>
            {t("realtimeFeed")}
          </div>
        </div>
      </div>
    </div>
  );
}
