"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  LineChart,
  Network,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppPreferences } from "@/components/providers/app-preferences-provider";

const features = [
  { id: "interview" as const, icon: MessageSquare },
  { id: "scoring" as const, icon: LineChart },
  { id: "resume" as const, icon: ShieldCheck },
  { id: "linkedin" as const, icon: Network },
];

export function LandingView() {
  const { t } = useAppPreferences();

  return (
    <div className="space-y-16 pb-16">
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border/90 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm dark:bg-muted/50 dark:text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-300" />
            {t("landing.badge")}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.55 }}
            className="mt-5 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl sm:leading-[1.06] lg:text-6xl lg:leading-[1.05]"
          >
            {t("landing.heroTitle1")}
            <span className="landing-hero-gradient mt-1 block">
              {t("landing.heroTitle2")}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.55 }}
            className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-700 sm:text-lg dark:text-muted-foreground"
          >
            {t("landing.heroBody")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.55 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button asChild size="lg">
              <Link href="/interview" className="inline-flex items-center gap-2">
                {t("landing.ctaInterview")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/dashboard">{t("landing.ctaDashboard")}</Link>
            </Button>
          </motion.div>
          <div className="mt-8 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-muted-foreground">
            <Badge variant="default">{t("landing.techBadgeNext")}</Badge>
            <Badge variant="default">{t("landing.techBadgeLlm")}</Badge>
            <Badge variant="default">{t("landing.techBadgeDb")}</Badge>
            <Badge variant="default">{t("landing.techBadgeState")}</Badge>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="relative"
        >
          <div className="absolute -inset-6 rounded-[28px] bg-gradient-to-tr from-cyan-400/18 via-transparent to-violet-500/22 blur-2xl dark:from-cyan-500/25 dark:to-violet-600/30" />
          <Card className="relative overflow-hidden border-border/90 bg-card shadow-md shadow-slate-900/10 ring-1 ring-slate-900/[0.05] dark:border-border dark:bg-white/[0.06] dark:shadow-2xl dark:shadow-cyan-500/10 dark:ring-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_58%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%)]" />
            <CardHeader className="relative z-10 pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-950 dark:text-card-foreground">
                  <Brain className="h-4 w-4 shrink-0 text-cyan-700 dark:text-cyan-300" />
                  {t("landing.previewTitle")}
                </CardTitle>
                <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-950 ring-1 ring-emerald-700/20 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-0">
                  {t("landing.previewStreaming")}
                </span>
              </div>
              <CardDescription className="text-[0.9375rem] text-slate-700 dark:text-muted-foreground">
                {t("landing.previewDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3 text-sm">
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/90 p-4 dark:border-border dark:bg-black/30 dark:backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-muted-foreground">
                  {t("landing.previewRecruiter")}
                </p>
                <p className="mt-2 leading-relaxed text-slate-900 dark:text-foreground/90">
                  {t("landing.previewRecruiterMsg")}
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/16 to-violet-600/14 p-4 dark:border-cyan-500/25 dark:from-cyan-500/15">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-950 dark:text-cyan-100/70">
                  {t("landing.previewCandidate")}
                </p>
                <p className="mt-2 leading-relaxed text-slate-900 dark:text-foreground/90">
                  {t("landing.previewCandidateMsg")}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-muted-foreground">
                <span>{t("landing.previewFooter")}</span>
                <span className="tabular-nums">{t("landing.previewFooterMeta")}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t("landing.sectionTitle")}
            </h2>
            <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("landing.sectionBody")}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/resume">{t("landing.sectionCta")}</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
              >
                <Card className="h-full border-border/90 transition hover:border-cyan-600/28 hover:shadow-md dark:border-border dark:shadow-none dark:hover:border-cyan-400/25 dark:hover:shadow-none">
                  <CardHeader>
                    <Icon className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                    <CardTitle className="text-lg font-semibold tracking-tight">
                      {t(`landing.features.${f.id}.title`)}
                    </CardTitle>
                    <CardDescription className="text-[0.9375rem]">
                      {t(`landing.features.${f.id}.description`)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
