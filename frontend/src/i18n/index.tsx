import { createContext, useContext, useCallback, useState, type ReactNode } from "react";
import en from "./locales/en";
import zhCN from "./locales/zh-CN";
import type { Locale } from "./locales/en";

const locales: Record<string, Locale> = { en, "zh-CN": zhCN };
const STORAGE_KEY = "silentbid-locale";

function getInitialLocale(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && locales[stored]) return stored;
  }
  return import.meta.env.VITE_LOCALE || "en";
}

type I18nContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

function resolve(obj: any, path: string): string | undefined {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function I18nProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: string }) {
  const [locale, setLocaleState] = useState(() => initialLocale || getInitialLocale());
  const dict = locales[locale] ?? en;

  const setLocale = useCallback((next: string) => {
    if (!locales[next]) return;
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const template = resolve(dict, key);
      if (template === undefined) {
        const enTemplate = resolve(en, key);
        if (enTemplate === undefined) return key;
        if (!params) return enTemplate;
        return enTemplate.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
      }
      if (!params) return template;
      return template.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
    },
    [dict],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
