import { useState, useEffect, type ReactNode } from "react";
import { translations, type TranslationKey } from "../i18n/translations";
import type { Language } from "../types";
import { LangContext } from "../context/langContextDef";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggleDark = () => setDark((d) => !d);
  const toggleLang = () => setLang((l) => (l === "en" ? "fr" : "en"));

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || key;
  };

  return (
    <LangContext.Provider
      value={{ lang, setLang, dark, toggleDark, toggleLang, t }}
    >
      {children}
    </LangContext.Provider>
  );
}
