"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppPreferences } from "@/components/providers/app-preferences-provider";

const links: { href: string; labelKey: string }[] = [
  { href: "/dashboard", labelKey: "nav.dashboard" },
  { href: "/interview", labelKey: "nav.interview" },
  { href: "/resume", labelKey: "nav.resume" },
  { href: "/linkedin", labelKey: "nav.linkedin" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { t } = useAppPreferences();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/85 backdrop-blur-xl dark:bg-background/75">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 shadow-lg shadow-cyan-500/25">
              <Sparkles className="h-5 w-5 text-white" aria-hidden />
            </span>
            <span className="text-sm font-semibold tracking-tight sm:text-base">
              FalconHire{" "}
              <span className="bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent dark:from-cyan-200 dark:to-violet-200">
                AI
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label={t("nav.primary")}>
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href}>
                  <span
                    className={cn(
                      "relative rounded-lg px-3 py-2 text-sm font-medium tracking-tight text-muted-foreground transition hover:text-foreground",
                      active && "text-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg bg-slate-200/80 dark:bg-muted"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">{t(link.labelKey)}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {status === "authenticated" && session?.user && (
              <span className="hidden max-w-[140px] truncate text-xs text-muted-foreground sm:inline">
                {session.user.email}
              </span>
            )}
            {status === "authenticated" ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => void signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("nav.signOut")}</span>
                </Button>
                <Link
                  href="/interview"
                  className="rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-900/15 transition hover:brightness-[1.03] sm:text-sm dark:from-cyan-500 dark:to-violet-500 dark:shadow-cyan-500/20"
                >
                  {t("nav.startMockInterview")}
                </Link>
              </>
            ) : (
              <Link
                href="/signin"
                className="rounded-xl border border-slate-200/95 bg-white px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:bg-slate-50 sm:text-sm dark:border-border dark:bg-muted/60 dark:shadow-none dark:hover:bg-muted"
              >
                {t("nav.signIn")}
              </Link>
            )}
          </div>
        </div>
        <nav
          className="flex gap-1 overflow-x-auto pb-3 md:hidden"
          aria-label={t("nav.primaryMobile")}
        >
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium",
                  active
                    ? "bg-slate-200/90 text-foreground dark:bg-muted"
                    : "text-muted-foreground hover:bg-slate-100/90 hover:text-foreground dark:hover:bg-muted/60",
                )}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
