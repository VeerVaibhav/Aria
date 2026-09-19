"use client";

import { Download } from "lucide-react";
import { useLanguage } from "@/lib/language";

export default function PageIntro() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {t("title")}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          {t("subTitle")}
        </p>
      </div>
      <a
        href="/api/v1/export/esankhyiki?format=csv"
        download="mospi_esankhyiki_apix_bulletin.csv"
        className="inline-flex items-center gap-2 border px-4 py-2 text-sm font-semibold no-underline transition-none"
        style={{ borderColor: "var(--accent)", color: "var(--accent)", background: "var(--card-bg)" }}
      >
        <Download className="h-4 w-4" aria-hidden />
        {t("exportBtn")}
      </a>
    </div>
  );
}
