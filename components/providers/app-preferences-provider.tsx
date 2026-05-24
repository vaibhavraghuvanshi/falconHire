"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { translate, type Locale } from "@/lib/i18n/messages";

export type Theme = "dark" | "light";

const STORAGE_THEME = "falconhire-theme";
const STORAGE_LOCALE = "falconhire-locale";

type AppPreferencesContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(
  null,
);

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const raw = window.localStorage.getItem(STORAGE_THEME);
  return raw === "light" ? "light" : "dark";
}

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const raw = window.localStorage.getItem(STORAGE_LOCALE);
  return raw === "ar" ? "ar" : "en";
}

function applyDocumentChrome(theme: Theme, locale: Locale) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.lang = locale;
  root.dir = locale === "ar" ? "rtl" : "ltr";
  try {
    window.localStorage.setItem(STORAGE_THEME, theme);
    window.localStorage.setItem(STORAGE_LOCALE, locale);
  } catch {
    /* ignore quota / private mode */
  }
}

export function AppPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [locale, setLocaleState] = useState<Locale>("en");
  const bootstrapped = useRef(false);

  useLayoutEffect(() => {
    if (!bootstrapped.current) {
      bootstrapped.current = true;
      const t = readStoredTheme();
      const l = readStoredLocale();
      setThemeState(t);
      setLocaleState(l);
      applyDocumentChrome(t, l);
      return;
    }
    applyDocumentChrome(theme, locale);
  }, [theme, locale]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: string) => translate(locale, key),
    [locale],
  );

  const value = useMemo(
    () => ({ theme, setTheme, locale, setLocale, t }),
    [theme, setTheme, locale, setLocale, t],
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  const ctx = useContext(AppPreferencesContext);
  if (!ctx) {
    throw new Error("useAppPreferences must be used within AppPreferencesProvider");
  }
  return ctx;
}
