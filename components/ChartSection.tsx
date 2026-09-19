"use client";

import { i18n } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";

type I18nKey = keyof typeof i18n.en;

type Props = {
  id: string;
  titleKey: I18nKey;
  descKey: I18nKey;
  date?: string;
  children: React.ReactNode;
};

/** Civic card section with fully bilingual heading + description (date interpolated). */
export default function ChartSection({ id, titleKey, descKey, date, children }: Props) {
  const { t } = useLanguage();
  const desc = t(descKey).replace("{date}", date ?? "");
  return (
    <section className="civic-card p-4" aria-labelledby={id}>
      <h2 id={id} className="text-sm font-semibold">
        {t(titleKey)}
      </h2>
      <p className="mb-2 text-xs" style={{ color: "var(--text-secondary)" }}>
        {desc}
      </p>
      {children}
    </section>
  );
}
