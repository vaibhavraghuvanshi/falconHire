"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  FileText,
  Network,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type HistoryInterview = {
  id: string;
  title: string | null;
  createdAt: string;
  score: unknown;
  _count: { messages: number };
};

export function DashboardView() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [interviews, setInterviews] = useState<HistoryInterview[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadHistory = useCallback(() => {
    void fetch("/api/history", { cache: "no-store", credentials: "include" })
      .then(async (r) => {
        const data = (await r.json()) as {
          connected?: boolean;
          interviews?: HistoryInterview[];
          error?: string;
        };
        if (!r.ok) {
          setHistoryError(
            data.error ?? `Could not load interview history (${r.status}).`,
          );
          setConnected(false);
          setInterviews([]);
          return;
        }
        setHistoryError(null);
        setConnected(Boolean(data.connected));
        setInterviews(data.interviews ?? []);
      })
      .catch(() => {
        setHistoryError("Network error while loading history.");
        setConnected(false);
        setInterviews([]);
      });
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") loadHistory();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadHistory]);

  const stats = [
    {
      label: "Mock interviews",
      value: interviews.length ? `${interviews.length}` : "—",
      hint: connected
        ? "Persisted sessions in Postgres"
        : "Connect DATABASE_URL to persist",
    },
    {
      label: "Latest focus",
      value: "GCC HR + ATS",
      hint: "UAE salary, visa, notice period aware flows",
    },
    {
      label: "AI surfaces",
      value: "4",
      hint: "Interview, score, resume, LinkedIn",
    },
  ];

  const actions = [
    {
      title: "Launch AI interview",
      desc: "Streaming recruiter dialogue with GCC-aware follow-ups.",
      href: "/interview",
      icon: MessageSquare,
    },
    {
      title: "Analyze resume",
      desc: "ATS + GCC recruiter feedback in structured JSON.",
      href: "/resume",
      icon: FileText,
    },
    {
      title: "Optimize LinkedIn",
      desc: "Headline, About, bullets, and recruiter summaries.",
      href: "/linkedin",
      icon: Network,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            Mission control
          </h1>
          <Badge variant={connected ? "success" : "warning"}>
            {connected === null
              ? "Checking data plane"
              : connected
                ? "Postgres connected"
                : "Local demo mode"}
          </Badge>
        </div>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          FalconHire AI bundles the artifacts recruiters expect from strong
          candidates in UAE/GCC markets—mock screens, crisp scoring, resume
          signal, and LinkedIn packaging.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="h-full border-border/90 transition hover:border-cyan-600/25 hover:shadow-md dark:hover:border-cyan-400/25 dark:hover:shadow-none">
              <CardHeader className="pb-2">
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-3xl font-semibold tabular-nums tracking-tight">
                  {s.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-relaxed text-muted-foreground">{s.hint}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
          <motion.div
            key={a.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className="group h-full border-border/90 bg-gradient-to-br from-white to-slate-50/90 transition duration-200 hover:border-cyan-600/28 hover:shadow-md dark:from-muted/80 dark:to-transparent dark:hover:border-cyan-400/30 dark:hover:shadow-none">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <Icon className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
                </div>
                <CardTitle className="text-lg font-semibold tracking-tight">{a.title}</CardTitle>
                <CardDescription className="text-[0.9375rem]">{a.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary" className="w-full">
                  <Link href={a.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          );
        })}
      </div>

      <Card className="border-border/90">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <BarChart3 className="h-4 w-4 text-violet-600 dark:text-violet-300" />
              Interview history
            </CardTitle>
            <CardDescription className="max-w-2xl text-[0.9375rem]">
              Recent mock interviews from Postgres (matched to your account by
              email and session id).
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {historyError ? (
            <p className="rounded-lg border border-rose-300/60 bg-rose-50 px-4 py-3 text-sm leading-relaxed text-rose-900 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-100">
              {historyError}
            </p>
          ) : null}
          {!historyError && interviews.length === 0 && (
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              No persisted sessions yet. Open{" "}
              <Link href="/interview" className="font-medium text-cyan-700 underline-offset-2 hover:underline dark:text-cyan-300">
                AI interview
              </Link>
              , tap <strong className="font-semibold text-foreground">Start new session</strong>
              , then return here—sessions and transcripts save when Postgres is
              connected.
            </p>
          )}
          {interviews.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-slate-50/90 px-4 py-3 text-sm dark:border-border dark:bg-muted/40"
            >
              <div>
                <p className="font-medium text-foreground">
                  {row.title ?? "Interview session"}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {new Date(row.createdAt).toLocaleString()} ·{" "}
                  {row._count.messages} messages
                </p>
              </div>
              <Badge variant="default">
                {row.score ? "Scored" : "No score stored"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
