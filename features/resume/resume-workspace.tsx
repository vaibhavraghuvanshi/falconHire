"use client";

import { useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ResumeAnalysisResult } from "@/types/chat";

export function ResumeWorkspace() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      if (file) form.append("file", file);
      if (text.trim()) form.append("text", text.trim());

      const res = await fetch("/api/resume", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as {
        result?: ResumeAnalysisResult;
        error?: string;
      };
      if (!res.ok || !data.result) {
        throw new Error(data.error ?? "Analysis failed");
      }
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/90">
        <CardHeader>
          <CardTitle className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
            Resume analyzer
          </CardTitle>
          <CardDescription className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
            Upload a PDF or paste plain text. FalconHire returns ATS-oriented
            notes, GCC recruiter expectations, and prioritized fixes—structured
            for fast iteration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/90 bg-white/90 px-6 py-10 text-center shadow-sm transition hover:border-cyan-600/40 hover:bg-slate-50 dark:border-border dark:bg-muted/40 dark:shadow-none dark:hover:border-cyan-400/40 dark:hover:bg-muted/70">
              <UploadCloud className="mb-3 h-8 w-8 text-cyan-600 dark:text-cyan-300" />
              <p className="text-sm font-medium text-foreground">
                Drop PDF / .txt / .md
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                PDFs are parsed server-side with pdf-parse (Node runtime).
              </p>
              <input
                type="file"
                accept=".pdf,.txt,.md,text/plain,application/pdf"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file && (
                <p className="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-200">
                  Selected: {file.name}
                </p>
              )}
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Or paste resume text here (recommended for fastest turnaround)…"
              className="min-h-[180px]"
              aria-label="Resume text"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Run AI analysis
              </Button>
              {error && (
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200" role="alert">
                  {error}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/90 bg-gradient-to-br from-cyan-500/8 via-transparent to-violet-600/10 dark:from-cyan-500/10 dark:to-violet-600/10">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-semibold tracking-tight">
                  Overall quality
                </CardTitle>
                <Badge variant="success" className="tabular-nums">
                  {result.overallScore}/100
                </Badge>
              </div>
              <CardDescription className="text-[0.9375rem] leading-relaxed">
                ATS readiness: {result.atsReadiness.score}/100 —{" "}
                {result.atsReadiness.notes}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-foreground/90">
              <p className="font-semibold text-foreground">Elevator pitch</p>
              <p className="leading-relaxed">{result.elevatorPitch}</p>
            </CardContent>
          </Card>

          <Card className="border-border/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight">
                GCC recruiter lens
              </CardTitle>
              <CardDescription className="text-[0.9375rem]">
                What hiring teams in UAE/GCC contexts typically scan for.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm leading-relaxed text-foreground/90">
                {result.gccRecruiterNotes.map((n) => (
                  <li key={n} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-600 dark:bg-cyan-300" />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight">
                Missing keywords
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {result.missingKeywords.map((k) => (
                <Badge key={k} variant="warning">
                  {k}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight">
                Formatting & structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm leading-relaxed text-foreground/90">
                {result.formattingIssues.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500 dark:bg-amber-300" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/90 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight">
                Prioritized improvements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal space-y-2 ps-5 text-sm leading-relaxed text-foreground/90">
                {result.improvements.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
