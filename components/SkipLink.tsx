"use client";

import { useLanguage } from "@/lib/language";

export default function SkipLink() {
  const { t } = useLanguage();
  return (
    <a href="#main-content" className="skip-link">
      {t("skipContent")}
    </a>
  );
}
