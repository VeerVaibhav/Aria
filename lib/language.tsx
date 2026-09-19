"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { i18n, type Locale } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Locale;
  setLang: (lang: Locale) => void;
  t: (key: keyof typeof i18n.en) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("apix-lang");
    if (saved === "hi" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (next: Locale) => {
    setLangState(next);
    window.localStorage.setItem("apix-lang", next);
    document.documentElement.lang = next === "hi" ? "hi" : "en";
  };

  const t = (key: keyof typeof i18n.en) => i18n[lang][key];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
