"use client";

import { useEffect, useState } from "react";
import { Contrast, Languages } from "lucide-react";
import { useLanguage } from "@/lib/language";

const FONT_STEPS = [
  { label: "A-", size: "14px", px: 14 },
  { label: "A", size: "16px", px: 16 },
  { label: "A+", size: "18px", px: 18 },
] as const;

export default function AccessibilityBar() {
  const { lang, setLang, t } = useLanguage();
  const [fontPx, setFontPx] = useState(16);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const savedFont = Number(window.localStorage.getItem("apix-font-px"));
    const savedContrast = window.localStorage.getItem("apix-contrast") === "high";
    if (savedFont === 14 || savedFont === 16 || savedFont === 18) applyFont(savedFont);
    if (savedContrast) applyContrast(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFont = (px: number) => {
    setFontPx(px);
    document.documentElement.style.setProperty("--portal-text-size", `${px}px`);
    window.localStorage.setItem("apix-font-px", String(px));
  };

  const applyContrast = (on: boolean) => {
    setHighContrast(on);
    document.documentElement.classList.toggle("high-contrast", on);
    window.localStorage.setItem("apix-contrast", on ? "high" : "standard");
  };

  const base =
    "min-w-[2.25rem] px-2 py-1 text-sm font-semibold border transition-none";

  return (
    <div
      className="hc-invert w-full border-b"
      style={{ background: "var(--a11y-bg)", borderColor: "var(--a11y-border)" }}
      role="region"
      aria-label={t("fontSize")}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
            {t("fontSize")}:
          </span>
          {FONT_STEPS.map((step) => (
            <button
              key={step.label}
              type="button"
              onClick={() => applyFont(step.px)}
              aria-pressed={fontPx === step.px}
              aria-label={`${t("fontSize")} ${step.label}`}
              className={base}
              style={{
                background: fontPx === step.px ? "var(--accent)" : "transparent",
                color: fontPx === step.px ? "var(--header-text)" : "var(--text-primary)",
                borderColor: "var(--card-border)",
              }}
            >
              {step.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Contrast className="h-4 w-4" style={{ color: "var(--text-secondary)" }} aria-hidden />
          <button
            type="button"
            onClick={() => applyContrast(!highContrast)}
            aria-pressed={highContrast}
            className={base}
            style={{
              background: highContrast ? "var(--accent)" : "transparent",
              color: highContrast ? "#000000" : "var(--text-primary)",
              borderColor: "var(--card-border)",
            }}
          >
            {highContrast ? t("contrastHigh") : t("contrastNormal")}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4" style={{ color: "var(--text-secondary)" }} aria-hidden />
          {(["en", "hi"] as const).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLang(loc)}
              aria-pressed={lang === loc}
              className={base}
              style={{
                background: lang === loc ? "var(--accent)" : "transparent",
                color: lang === loc ? "var(--header-text)" : "var(--text-primary)",
                borderColor: "var(--card-border)",
              }}
            >
              {loc === "en" ? "English" : "हिन्दी"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
