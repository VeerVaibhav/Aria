"use client";

import { useEffect, useState } from "react";
import { Clock, Code, Contrast, Languages, Radio } from "lucide-react";
import { useLanguage } from "@/lib/language";

function EmblemPlaceholder() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-10 w-10 shrink-0"
      role="img"
      aria-label="Emblem of India"
    >
      <circle cx="24" cy="24" r="23" fill="#FF9933" />
      <circle cx="24" cy="24" r="19.5" fill="none" stroke="#0B3C5D" strokeWidth="1.4" />
      <rect x="12" y="33" width="24" height="3.4" rx="0.8" fill="#0B3C5D" />
      <path
        d="M17 33c0-6 1.6-10.5 4.6-13.2 1-0.9 1.9-2.2 2.1-3.6l0.4-2.4 1.8 1.2 1.8-1.2 0.4 2.4c0.2 1.4 1.1 2.7 2.1 3.6 3 2.7 4.6 7.2 4.6 13.2z"
        fill="#0B3C5D"
      />
      <path d="M13.2 33c0.2-4.2 1.1-7.4 2.6-9.6 0.4 3.2 0.4 6.6 0.2 9.6z" fill="#0B3C5D" opacity="0.75" />
      <path d="M34.8 33c-0.2-4.2-1.1-7.4-2.6-9.6-0.4 3.2-0.4 6.6-0.2 9.6z" fill="#0B3C5D" opacity="0.75" />
      <text x="24" y="44.4" textAnchor="middle" fontSize="5.2" fill="#0B3C5D" fontWeight="700">
        सत्यमेव
      </text>
    </svg>
  );
}

export default function SiteHeader() {
  const { lang, setLang, t } = useLanguage();
  const [clockStr, setClockStr] = useState<string>("");
  const [todayStr, setTodayStr] = useState<string>("");
  const [highContrast, setHighContrast] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockStr(
        now.toLocaleTimeString("en-IN", {
          hour12: false,
          timeZone: "Asia/Kolkata",
        }) + " IST"
      );
      setTodayStr(
        now.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "Asia/Kolkata",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const applyContrast = (on: boolean) => {
    setHighContrast(on);
    document.documentElement.classList.toggle("high-contrast", on);
    window.localStorage.setItem("apix-contrast", on ? "high" : "standard");
  };

  const handleApiDownload = () => {
    window.open("/api/v1/export/esankhyiki", "_blank");
  };

  return (
    <header className="hc-invert sticky top-0 z-40 w-full border-b" style={{ background: "var(--header-bg)", borderColor: "var(--card-border)" }}>
      <div className="mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <EmblemPlaceholder />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#FF9933" }}>
                {t("nationalPortal")}
              </span>
              <span className="text-[10px] opacity-60" style={{ color: "var(--header-text)" }}>•</span>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.85)" }}>
                MoSPI / NSO
              </span>
            </div>
            <h1 className="text-base font-bold leading-tight" style={{ color: "var(--header-text)" }}>
              {t("commandCenterTitle")}
            </h1>
            <p className="text-xs opacity-80" style={{ color: "var(--header-text)" }}>
              {t("commandCenterSub")}
            </p>
          </div>
        </div>

        {/* Right Utility Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Status Pill */}
          <span className="inline-flex items-center gap-1.5 border border-green-500/40 bg-green-950/60 px-2.5 py-1 text-xs font-bold text-green-400">
            <Radio className="h-3 w-3 animate-pulse text-green-400" aria-hidden />
            <span>{t("liveStatus")}</span>
          </span>

          {/* Data Freshness Badge */}
          {todayStr && (
            <span className="hidden text-xs font-medium md:inline-block" style={{ color: "rgba(255,255,255,0.85)" }}>
              Data as of {todayStr}
            </span>
          )}

          {/* IST Live Clock */}
          {clockStr && (
            <span className="inline-flex items-center gap-1 font-mono text-xs font-bold" style={{ color: "#FFE600" }}>
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {clockStr}
            </span>
          )}

          {/* Theme / Contrast Toggle */}
          <button
            type="button"
            onClick={() => applyContrast(!highContrast)}
            aria-label={t("contrast")}
            className="border p-1.5 text-xs font-semibold hover:bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "var(--header-text)" }}
          >
            <Contrast className="h-4 w-4" aria-hidden />
          </button>

          {/* Language Toggle */}
          <div className="flex items-center border" style={{ borderColor: "rgba(255,255,255,0.3)" }}>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2 py-1 text-xs font-bold ${lang === "en" ? "bg-amber-500 text-slate-950" : "text-white hover:bg-white/10"}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("hi")}
              className={`px-2 py-1 text-xs font-bold ${lang === "hi" ? "bg-amber-500 text-slate-950" : "text-white hover:bg-white/10"}`}
            >
              HI
            </button>
          </div>

          {/* API Access Export Button */}
          <button
            type="button"
            onClick={handleApiDownload}
            className="inline-flex items-center gap-1.5 border border-amber-500 bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            <Code className="h-3.5 w-3.5" aria-hidden />
            <span>&gt;_ {t("apiAccess")}</span>
          </button>
        </div>
      </div>
      <div className="h-[2px] w-full" style={{ background: "#FF9933" }} aria-hidden />
    </header>
  );
}
