"use client";

import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAppPreferences,
  type Theme,
} from "@/components/providers/app-preferences-provider";
import type { Locale } from "@/lib/i18n/messages";

export function SegmentedToggle<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
  fullWidth,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-slate-200/90 bg-white/90 p-0.5 dark:border-border dark:bg-muted/40",
        fullWidth && "w-full [&>button]:flex-1 [&>button]:justify-center",
        className,
      )}
      role="group"
      aria-label={label}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition sm:px-3 sm:text-xs",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Stacked theme + language controls for flyout / dock panel. */
export function AppPreferencesControls() {
  const { theme, setTheme, locale, setLocale, t } = useAppPreferences();

  return (
    <div className="flex w-full min-w-[13rem] max-w-[15rem] flex-col gap-4">
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t("preferences.themeLabel")}
        </p>
        <SegmentedToggle<Theme>
          label={t("preferences.themeLabel")}
          value={theme}
          onChange={setTheme}
          fullWidth
          options={[
            { value: "dark", label: t("preferences.themeDark") },
            { value: "light", label: t("preferences.themeLight") },
          ]}
        />
      </div>
      <div className="space-y-1.5">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Languages className="h-3 w-3" aria-hidden />
          {t("preferences.languageLabel")}
        </p>
        <SegmentedToggle<Locale>
          label={t("preferences.languageLabel")}
          value={locale}
          onChange={setLocale}
          fullWidth
          options={[
            { value: "en", label: t("preferences.languageEn") },
            { value: "ar", label: t("preferences.languageAr") },
          ]}
        />
      </div>
    </div>
  );
}
