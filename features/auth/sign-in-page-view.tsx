"use client";

import Link from "next/link";
import { Suspense } from "react";
import { SignInPanel } from "@/features/auth/sign-in-panel";
import { useAppPreferences } from "@/components/providers/app-preferences-provider";

export function SignInPageView() {
  const { t } = useAppPreferences();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 py-12">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("signIn.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("signIn.subtitle")}</p>
      </div>
      <Suspense
        fallback={
          <div className="rounded-2xl border border-border/90 bg-card p-8 text-sm leading-relaxed text-muted-foreground">
            {t("signIn.loading")}
          </div>
        }
      >
        <SignInPanel />
      </Suspense>
      <p className="text-center text-xs text-muted-foreground">
        <Link href="/" className="text-cyan-600 hover:underline dark:text-cyan-300">
          {t("signIn.backHome")}
        </Link>
      </p>
    </div>
  );
}
