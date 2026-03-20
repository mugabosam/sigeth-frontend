import { createContext } from "react";
import type { Language } from "../types";
import type { TranslationKey } from "../i18n/translations";

interface LangContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  dark: boolean;
  toggleDark: () => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

export const LangContext = createContext<LangContextType | undefined>(
  undefined,
);
