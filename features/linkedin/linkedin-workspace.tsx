"use client";

import { useState } from "react";
import { Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { LinkedInOptimizationResult } from "@/types/chat";
import { useCopyToClipboard } from "@/hooks/use-copy";

function CopyBlock({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8"
          onClick={() => void copy(text)}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <Textarea
        readOnly
        value={text}
        className="min-h-[120px] font-mono text-xs leading-relaxed text-foreground/90"
      />
    </div>
  );
}

export function LinkedInWorkspace() {
  const [currentRole, setCurrentRole] = useState("");
  const [targetRoles, setTargetRoles] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [achievements, setAchievements] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LinkedInOptimizationResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRole,
          targetRoles,
          yearsExperience,
          skills,
          achievements,
          location,
        }),
      });
      const data = (await res.json()) as {
        result?: LinkedInOptimizationResult;
        error?: string;
      };
      if (!res.ok || !data.result) {
        throw new Error(data.error ?? "Generation failed");
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
            LinkedIn profile optimizer
          </CardTitle>
          <CardDescription className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
            Structured JSON outputs for headline, About, achievement bullets, and
            recruiter summaries—tuned for UAE/GCC hiring managers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="role">Current role / title</Label>
              <Input
                id="role"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targets">Target roles (UAE/GCC)</Label>
              <Input
                id="targets"
                value={targetRoles}
                onChange={(e) => setTargetRoles(e.target.value)}
                placeholder="e.g. Staff Engineer, Dubai tech scale-ups"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years">Years of experience</Label>
              <Input
                id="years"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="e.g. 7+ years shipping web products"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location / mobility</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote today, open to Dubai on-site"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="skills">Key skills & stack</Label>
              <Textarea
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Next.js, design systems, performance, GraphQL…"
                className="min-h-[96px]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="achievements">Impact & achievements</Label>
              <Textarea
                id="achievements"
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="Metrics, scope, stakeholders, GCC-relevant delivery if any…"
                className="min-h-[120px]"
              />
            </div>
            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Generate LinkedIn pack
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
        <div className="space-y-4">
          <Card className="border-border/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight">
                Keyword cloud
              </CardTitle>
              <CardDescription className="text-[0.9375rem]">
                ATS-friendly tokens you can weave into Experience bullets.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {result.keywords.map((k) => (
                <Badge key={k} variant="default">
                  {k}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight">
                Optimized headline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CopyBlock label="Headline" text={result.headline} />
            </CardContent>
          </Card>

          <Card className="border-border/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight">
                About section
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CopyBlock label="About" text={result.about} />
            </CardContent>
          </Card>

          <Card className="border-border/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight">
                Achievement-ready bullets
              </CardTitle>
              <CardDescription className="text-[0.9375rem]">
                Paste into your Experience section and tune numbers to what you
                can defend in a screen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CopyBlock
                label="Bullets"
                text={result.featuredBullets.map((b) => `• ${b}`).join("\n")}
              />
            </CardContent>
          </Card>

          <Card className="border-border/90">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight">
                Recruiter email intro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CopyBlock label="Summary" text={result.recruiterSummary} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
