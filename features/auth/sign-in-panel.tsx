"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppPreferences } from "@/components/providers/app-preferences-provider";

export function SignInPanel() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const { t } = useAppPreferences();

  return (
    <Card className="border-border/90 bg-card">
      <CardHeader>
        <CardTitle className="text-base">{t("signIn.cardTitle")}</CardTitle>
        <CardDescription className="space-y-2 text-start">
          <span className="block bg-gradient-to-r from-cyan-600 via-sky-500 to-violet-600 bg-clip-text text-base font-medium leading-snug text-transparent dark:from-cyan-300 dark:via-sky-400 dark:to-violet-400">
            {t("signIn.cardHighlight")}
          </span>
          <span className="block text-[13px] leading-relaxed text-muted-foreground">
            {t("signIn.cardBody")}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          className="w-full"
          onClick={() =>
            void signIn("google", { callbackUrl })
          }
        >
          {t("signIn.googleCta")}
        </Button>
      </CardContent>
    </Card>
  );
}
