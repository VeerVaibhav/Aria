"use client";

import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/language";

export default function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="hc-invert mt-10 w-full border-t" style={{ background: "var(--header-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#FF9933" }} aria-hidden />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--header-text)" }}>
              {t("ministryName")}
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
              {t("footerDisclaimers")}
            </p>
          </div>
        </div>
      </div>
      <div className="h-[2px] w-full" style={{ background: "#138808" }} aria-hidden />
      <div className="h-[3px] w-full" style={{ background: "#FF9933" }} aria-hidden />
    </footer>
  );
}
