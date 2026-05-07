import { createContext, useContext, useCallback, type ReactNode } from "react";
import en from "./locales/en";
import zhCN from "./locales/zh-CN";
import type { Locale } from "./locales/en";

const locales: Record<string, Locale> = { en, "zh-CN": zhCN };

type I18nContextType = {
  locale: string;
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

export function I18nProvider({ locale, children }: { locale: string; children: ReactNode }) {
  const dict = locales[locale] ?? en;

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const template = resolve(dict, key);
      if (template === undefined) {
        // Fallback to English
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
    <I18nContext.Provider value={{ locale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
