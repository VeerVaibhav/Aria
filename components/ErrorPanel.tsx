"use client";

import { AlertOctagon } from "lucide-react";
import { useLanguage } from "@/lib/language";

export default function ErrorPanel({ message }: { message: string }) {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="civic-card p-6">
        <div className="flex items-start gap-3">
          <AlertOctagon className="mt-0.5 h-6 w-6 shrink-0" style={{ color: "var(--alert)" }} aria-hidden />
          <div>
            <h1 className="text-lg font-bold">{t("errorTitle")}</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {t("errorBody")}
            </p>
            <p className="mt-2 font-mono text-xs" style={{ color: "var(--alert)" }}>
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
