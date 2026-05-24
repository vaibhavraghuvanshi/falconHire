"use client";

import { Moon, Sun, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPreferences } from "@/components/providers/app-preferences-provider";
import { AppPreferencesControls } from "@/components/layout/app-preferences-controls";

/**
 * Fixed strip on the inline-end edge of the viewport (right in LTR, left in RTL).
 * Hover or keyboard focus reveals a panel toward inline-start (into the page).
 */
export function AppPreferencesDock() {
  const { theme, t } = useAppPreferences();

  return (
    <div
      className={cn(
        "group/prefs fixed top-1/2 z-[100] -translate-y-1/2",
        /* Clear scrollbar + notches; stay off the viewport’s inline-end edge */
        "end-[max(0.75rem,env(safe-area-inset-inline-end,0px))]",
        /* Invisible hit area extends toward page content (inline-start) */
        "py-10 ps-10 pe-[max(0.5rem,env(safe-area-inset-inline-end,0px))]",
      )}
    >
      <div className="relative inline-flex flex-row items-stretch">
        <div
          className={cn(
            "absolute end-full top-1/2 z-0 flex -translate-y-1/2 items-center",
            "me-2",
            "pointer-events-none invisible opacity-0 transition duration-200 ease-out",
            /* Slide slightly from under the strip; mirror in RTL */
            "translate-x-2 motion-reduce:translate-x-0 motion-reduce:opacity-100 motion-reduce:visible motion-reduce:pointer-events-auto",
            "rtl:-translate-x-2 rtl:motion-reduce:translate-x-0",
            "group-hover/prefs:pointer-events-auto group-hover/prefs:visible group-hover/prefs:translate-x-0 group-hover/prefs:opacity-100",
            "group-focus-within/prefs:pointer-events-auto group-focus-within/prefs:visible group-focus-within/prefs:translate-x-0 group-focus-within/prefs:opacity-100",
          )}
        >
          <div
            role="dialog"
            aria-label={t("preferences.dockAriaLabel")}
            className="w-56 rounded-2xl border border-border/95 bg-card/98 p-4 shadow-lg shadow-slate-900/12 backdrop-blur-xl dark:border-border dark:bg-card/95 dark:shadow-2xl"
          >
            <AppPreferencesControls />
          </div>
        </div>

        <button
          type="button"
          className={cn(
            "relative z-10 flex w-11 flex-col items-center justify-center gap-2.5 py-4",
            "rounded-e-2xl border border-s-0",
            "border-border bg-white/95 text-muted-foreground shadow-md ring-1 ring-slate-900/[0.06] backdrop-blur-xl dark:bg-background/95 dark:shadow-lg dark:ring-0",
            "transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
          aria-label={t("preferences.dockAriaLabel")}
          aria-haspopup="true"
        >
          {theme === "dark" ? (
            <Moon className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <Sun className="h-4 w-4 shrink-0" aria-hidden />
          )}
          <Languages className="h-4 w-4 shrink-0" aria-hidden />
        </button>
      </div>
    </div>
  );
}
