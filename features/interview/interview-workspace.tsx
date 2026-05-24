"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Square,
  Volume2,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { buildPrepPacketMarkdown } from "@/features/interview/build-prep-packet";
import { getFirstInterviewQuestion } from "@/lib/prompts/interview";
import { syncInterviewTranscriptToServer } from "@/lib/sync-interview-transcript";
import { useInterviewStore } from "@/store/interview-store";
import { toOpenAIMessages } from "@/utils/message";
import type { RecruiterScore } from "@/types/chat";

type VoiceInputMode = "text" | "voice" | "both";

type SpeechCaps = { transcribe: boolean; tts: boolean };

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-cyan-600/75 dark:bg-cyan-300/80"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function pickRecorderMimeType(): string | undefined {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
  ];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return undefined;
}

function MessageBubble({
  role,
  content,
  recruiterAudioEnabled,
  onPlayRecruiter,
  recruiterMessagePlaying,
}: {
  role: "user" | "assistant";
  content: string;
  recruiterAudioEnabled?: boolean;
  onPlayRecruiter?: () => void;
  recruiterMessagePlaying?: boolean;
}) {
  const isUser = role === "user";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[min(100%,36rem)] rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "border-cyan-500/25 bg-gradient-to-br from-cyan-500/20 to-violet-600/10 text-foreground shadow-cyan-900/10 dark:shadow-lg"
            : "border-slate-200/95 bg-white text-foreground/95 shadow-slate-900/8 dark:border-border dark:bg-white/[0.06] dark:text-foreground/90 dark:shadow-lg"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1 whitespace-pre-wrap">{content}</p>
          {!isUser && recruiterAudioEnabled && content.trim() ? (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 text-cyan-700 hover:bg-cyan-500/10 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-100"
              aria-label="Play recruiter reply"
              onClick={() => onPlayRecruiter?.()}
              disabled={!onPlayRecruiter}
            >
              {recruiterMessagePlaying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

function ScorePanel({ score }: { score: RecruiterScore | null }) {
  if (!score) {
    return (
      <Card className="h-full border-border/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
            Recruiter impression
          </CardTitle>
          <CardDescription className="text-[0.9375rem]">
            After two or more turns, tap{" "}
            <span className="font-medium text-foreground">Generate score</span> for a
            structured evaluation: Communication, Confidence, Professionalism,
            Technical clarity, and GCC readiness.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          <p>
            Scores are JSON-structured from the transcript so you can iterate
            quickly—similar to how hiring teams debrief after a screen.
          </p>
        </CardContent>
      </Card>
    );
  }

  const categories = [
    { key: "communication", label: "Communication" },
    { key: "confidence", label: "Confidence" },
    { key: "professionalism", label: "Professionalism" },
    { key: "technicalClarity", label: "Technical clarity" },
    { key: "gccReadiness", label: "GCC readiness" },
  ] as const;

  return (
    <Card className="h-full border-emerald-200/80 bg-gradient-to-b from-emerald-500/10 to-transparent ring-1 ring-emerald-900/[0.06] dark:border-emerald-400/15 dark:from-emerald-500/10 dark:ring-0">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold tracking-tight">
            Recruiter impression score
          </CardTitle>
          <Badge variant="success" className="text-sm tabular-nums">
            {score.overall}/100
          </Badge>
        </div>
        <CardDescription className="text-[0.9375rem]">{score.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          {categories.map((c) => (
            <div key={c.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{c.label}</span>
                <span className="tabular-nums text-foreground">
                  {score.categories[c.key]}%
                </span>
              </div>
              <Progress value={score.categories[c.key]} />
            </div>
          ))}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200/90">
            Strengths
          </p>
          <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/90">
            {score.strengths.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200/90">
            Needs improvement
          </p>
          <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/90">
            {score.needsImprovement.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500 dark:bg-amber-300" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export function InterviewWorkspace() {
  const {
    messages,
    status,
    score,
    sessionStarted,
    jobDescription,
    serverSessionId,
    addMessage,
    appendAssistantChunk,
    setStatus,
    setScore,
    resetSession,
    startSession,
    setJobDescription,
    setServerSessionId,
  } = useInterviewStore();

  const [input, setInput] = useState("");
  const [bootingSession, setBootingSession] = useState(false);
  const [sessionBootstrapError, setSessionBootstrapError] = useState<
    string | null
  >(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [speechCaps, setSpeechCaps] = useState<SpeechCaps | null>(null);
  const speechCapsRef = useRef<SpeechCaps | null>(null);

  const [voiceMode, setVoiceMode] = useState<VoiceInputMode>("both");
  const [voicePhase, setVoicePhase] = useState<
    "idle" | "recording" | "uploading"
  >("idle");
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const [sttLanguage, setSttLanguage] = useState<"auto" | "ar">("auto");
  const [autoPlayRecruiter, setAutoPlayRecruiter] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef = useRef<BlobPart[]>([]);
  const recordCancelRef = useRef(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const voiceBusy = voicePhase !== "idle";
  const busy =
    status === "streaming" ||
    status === "scoring" ||
    bootingSession ||
    voiceBusy;

  useEffect(() => {
    void fetch("/api/interview/speech-capabilities", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: SpeechCaps) => {
        setSpeechCaps(d);
      })
      .catch(() => {
        setSpeechCaps({ transcribe: false, tts: false });
      });
  }, []);

  useEffect(() => {
    speechCapsRef.current = speechCaps;
  }, [speechCaps]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  const playRecruiterAudio = useCallback(
    async (messageId: string | null, text: string) => {
      if (!text.trim() || !speechCapsRef.current?.tts) return;
      activeAudioRef.current?.pause();
      activeAudioRef.current = null;
      if (messageId) setPlayingMessageId(messageId);
      let objectUrl: string | null = null;
      try {
        const res = await fetch("/api/interview/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.trim() }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setVoiceHint(
            (err as { error?: string }).error ??
              "Could not play recruiter audio.",
          );
          setPlayingMessageId(null);
          return;
        }
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        const audio = new Audio(objectUrl);
        activeAudioRef.current = audio;
        audio.onended = () => {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          objectUrl = null;
          if (activeAudioRef.current === audio) activeAudioRef.current = null;
          setPlayingMessageId((cur) => (cur === messageId ? null : cur));
        };
        await audio.play();
      } catch {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        setVoiceHint(
          "Unable to play audio. Try “Enable recruiter voice” then the speaker icon again.",
        );
        setPlayingMessageId(null);
      }
    },
    [],
  );

  const beginInterview = useCallback(async () => {
    setBootingSession(true);
    setSessionBootstrapError(null);
    try {
      resetSession();
      const jd = useInterviewStore.getState().jobDescription.trim();
      const res = await fetch("/api/interview/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          jobDescription: jd || undefined,
          title: jd ? "JD-grounded mock interview" : "Mock interview",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        id?: string | null;
        error?: string;
      };
      if (!res.ok) {
        setSessionBootstrapError(
          data.error ?? `Could not save session to Postgres (${res.status}).`,
        );
        setServerSessionId(null);
      } else {
        setServerSessionId(data.id ?? null);
      }
      startSession();
      addMessage({
        role: "assistant",
        content: getFirstInterviewQuestion(Boolean(jd)),
      });
      const sid = useInterviewStore.getState().serverSessionId;
      if (sid) {
        void syncInterviewTranscriptToServer(
          sid,
          useInterviewStore.getState().messages,
        );
      }
    } finally {
      setBootingSession(false);
    }
  }, [addMessage, resetSession, setServerSessionId, startSession]);

  const streamAssistant = useCallback(
    async (
      apiMessages: ReturnType<typeof toOpenAIMessages>,
      options?: { speakReply?: boolean },
    ) => {
      const assistant = addMessage({ role: "assistant", content: "" });
      setStatus("streaming");

      const jd =
        useInterviewStore.getState().jobDescription.trim() || undefined;

      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, jobDescription: jd }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        appendAssistantChunk(
          assistant.id,
          `\n\n${(err as { error?: string }).error ?? "Unable to reach AI service."}`,
        );
        setStatus("idle");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) appendAssistantChunk(assistant.id, chunk);
      }
      const sid = useInterviewStore.getState().serverSessionId;
      if (sid) {
        void syncInterviewTranscriptToServer(
          sid,
          useInterviewStore.getState().messages,
        );
      }
      setStatus("idle");

      const final =
        useInterviewStore
          .getState()
          .messages.find((m) => m.id === assistant.id)?.content ?? "";
      if (
        options?.speakReply &&
        autoPlayRecruiter &&
        audioUnlocked &&
        speechCapsRef.current?.tts &&
        final.trim()
      ) {
        void playRecruiterAudio(assistant.id, final);
      }
    },
    [
      addMessage,
      appendAssistantChunk,
      setStatus,
      playRecruiterAudio,
      autoPlayRecruiter,
      audioUnlocked,
    ],
  );

  const sendUserMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || busy || !sessionStarted) return;
    setInput("");
    addMessage({ role: "user", content: trimmed });
    const nextMessages = toOpenAIMessages(
      useInterviewStore.getState().messages,
    );
    await streamAssistant(nextMessages, {
      speakReply: autoPlayRecruiter && audioUnlocked,
    });
  }, [
    addMessage,
    busy,
    input,
    sessionStarted,
    streamAssistant,
    autoPlayRecruiter,
    audioUnlocked,
  ]);

  const submitVoiceAnswer = useCallback(
    async (blob: Blob) => {
      setVoicePhase("uploading");
      setVoiceHint(null);
      try {
        const fd = new FormData();
        fd.append("file", blob, "answer.webm");
        if (sttLanguage === "ar") fd.append("language", "ar");
        const res = await fetch("/api/interview/transcribe", {
          method: "POST",
          body: fd,
        });
        const data = (await res.json().catch(() => ({}))) as {
          text?: string;
          error?: string;
        };
        if (!res.ok || !data.text?.trim()) {
          setVoiceHint(data.error ?? "Transcription failed.");
          return;
        }
        addMessage({ role: "user", content: data.text.trim() });
        const nextMessages = toOpenAIMessages(
          useInterviewStore.getState().messages,
        );
        await streamAssistant(nextMessages, {
          speakReply: autoPlayRecruiter && audioUnlocked,
        });
      } finally {
        setVoicePhase("idle");
      }
    },
    [addMessage, streamAssistant, autoPlayRecruiter, audioUnlocked, sttLanguage],
  );

  const stopRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
  }, []);

  const cancelRecording = useCallback(() => {
    recordCancelRef.current = true;
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
    else setVoicePhase("idle");
  }, []);

  const startRecording = useCallback(async () => {
    if (!sessionStarted || busy || !speechCaps?.transcribe) return;
    if (voiceMode === "text") return;
    setVoiceHint(null);
    recordCancelRef.current = false;
    recordChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickRecorderMimeType();
      const mr = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) recordChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current = null;
        if (recordCancelRef.current) {
          recordCancelRef.current = false;
          setVoicePhase("idle");
          return;
        }
        const blob = new Blob(recordChunksRef.current, {
          type: mr.mimeType || "audio/webm",
        });
        recordChunksRef.current = [];
        if (blob.size === 0) {
          setVoiceHint("No audio captured. Check the microphone.");
          setVoicePhase("idle");
          return;
        }
        void submitVoiceAnswer(blob);
      };
      mr.start(250);
      setVoicePhase("recording");
    } catch {
      setVoiceHint("Microphone access denied or unavailable.");
    }
  }, [sessionStarted, busy, speechCaps, voiceMode, submitVoiceAnswer]);

  const requestScore = useCallback(async () => {
    const msgs = toOpenAIMessages(useInterviewStore.getState().messages);
    if (msgs.length < 2) return;
    setStatus("scoring");
    setScore(null);
    const { jobDescription: jdStore, serverSessionId: sid } =
      useInterviewStore.getState();
    const jdPayload = jdStore.trim() || undefined;
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: msgs,
          jobDescription: jdPayload,
          sessionId: sid ?? undefined,
        }),
      });
      const data = (await res.json()) as {
        score?: RecruiterScore;
        error?: string;
      };
      if (!res.ok || !data.score) {
        throw new Error(data.error ?? "Score request failed");
      }
      setScore(data.score);
    } catch {
      setScore({
        overall: 0,
        categories: {
          communication: 0,
          confidence: 0,
          professionalism: 0,
          technicalClarity: 0,
          gccReadiness: 0,
        },
        strengths: [],
        needsImprovement: [
          "Unable to generate a score. Check OPENAI_API_KEY and try again.",
        ],
        summary: "Scoring service unavailable for this attempt.",
      });
    } finally {
      setStatus("idle");
    }
  }, [setScore, setStatus]);

  const downloadPrepPacketFile = useCallback(() => {
    const s = useInterviewStore.getState();
    const md = buildPrepPacketMarkdown({
      generatedAt: new Date(),
      jobDescription: s.jobDescription,
      messages: s.messages,
      score: s.score,
    });
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `falconhire-prep-${new Date().toISOString().replace(/[:]/g, "-").slice(0, 19)}.md`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const showTyping =
    status === "streaming" &&
    messages[messages.length - 1]?.role === "assistant" &&
    messages[messages.length - 1]?.content.length === 0;

  const canDownloadPacket = sessionStarted && messages.length > 0;

  return (
    <div className="space-y-6">
      <Card className="border-border/90">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
                GCC HR interview simulator
              </CardTitle>
              <CardDescription className="mt-2 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
                Paste a target job description to ground questions and scoring on
                that posting, then export a Markdown prep packet you can share
                with a mentor. A curated GCC hiring context pack shapes tone and
                themes (interview coaching only—not legal advice). Optional{" "}
                <span className="font-medium text-foreground/90">voice answers</span>{" "}
                transcribe to text (same pipeline as typing); only transcripts are
                stored.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {jobDescription.trim() ? (
                <Badge variant="success">JD linked</Badge>
              ) : null}
              {serverSessionId ? (
                <Badge variant="default">Postgres session</Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionBootstrapError ? (
            <div
              className="rounded-lg border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-400/35 dark:bg-amber-500/10 dark:text-amber-50"
              role="alert"
            >
              {sessionBootstrapError}{" "}
              <span className="text-amber-900/90 dark:text-amber-100/80">
                You can keep practicing; the dashboard will not list this run
                until a session is saved.
              </span>
            </div>
          ) : null}
          <details className="group rounded-xl border border-slate-200/90 bg-slate-50/90 px-4 py-3 dark:border-border dark:bg-white/[0.02]">
            <summary className="cursor-pointer list-none text-sm font-medium text-foreground outline-none [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2">
                Target job description{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (optional, locked while a session is live)
                </span>
              </span>
            </summary>
            <div className="mt-3 space-y-2">
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={sessionStarted || busy}
                placeholder="Paste the full job posting here (responsibilities, requirements, stack)…"
                className="min-h-[140px] resize-y text-sm"
                aria-label="Target job description"
              />
              <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                <span>{jobDescription.length.toLocaleString()} characters</span>
                {!serverSessionId && jobDescription.trim() ? (
                  <span>
                    Set <code className="text-foreground/70">DATABASE_URL</code> to
                    persist this session on the dashboard.
                  </span>
                ) : null}
              </div>
            </div>
          </details>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => void beginInterview()}
              disabled={busy}
            >
              {bootingSession ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Start new session
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void requestScore()}
              disabled={busy || messages.length < 2}
            >
              {status === "scoring" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Generate score
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={downloadPrepPacketFile}
              disabled={!canDownloadPacket}
            >
              <Download className="h-4 w-4" />
              Download prep packet
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="flex min-h-[520px] flex-col border-border/90 p-0">
          <div className="border-b border-border/90 bg-slate-50/50 px-4 py-3 sm:px-6 dark:bg-transparent">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Live conversation
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Streaming tokens · recruiter tone · UAE/GCC aware · optional
                  voice (STT/TTS)
                </p>
              </div>
              <Badge variant="default">LLM + voice</Badge>
            </div>
          </div>
          <ScrollArea className="flex-1 px-4 py-4 sm:px-6">
            <div className="flex min-h-[360px] flex-col gap-4 pb-4">
              {!sessionStarted && (
                <p className="text-center text-sm leading-relaxed text-muted-foreground">
                  Start a session to open the mock interview channel.
                </p>
              )}
              <AnimatePresence initial={false}>
                {messages.map((m) =>
                  m.role === "assistant" || m.role === "user" ? (
                    <MessageBubble
                      key={m.id}
                      role={m.role}
                      content={m.content}
                      recruiterAudioEnabled={Boolean(speechCaps?.tts)}
                      onPlayRecruiter={
                        m.role === "assistant" && speechCaps?.tts
                          ? () => void playRecruiterAudio(m.id, m.content)
                          : undefined
                      }
                      recruiterMessagePlaying={playingMessageId === m.id}
                    />
                  ) : null,
                )}
              </AnimatePresence>
              {showTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200/90 bg-white px-4 py-2 shadow-sm dark:border-border dark:bg-white/[0.05] dark:shadow-none">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
          <div className="border-t border-border/90 bg-slate-50/40 p-4 sm:p-6 dark:bg-transparent">
            {speechCaps && (speechCaps.transcribe || speechCaps.tts) ? (
              <div className="mb-4 space-y-3 rounded-xl border border-border/90 bg-white/80 px-4 py-3 text-xs leading-relaxed text-muted-foreground shadow-sm dark:bg-white/[0.03]">
                <p className="font-medium text-foreground">Voice mode</p>
                <p>
                  Short audio is sent to your speech-to-text provider (OpenAI
                  Whisper or Groq). Recruiter voice playback uses OpenAI TTS when{" "}
                  <code className="text-foreground/80">OPENAI_API_KEY</code> is set.
                  Audio is not stored—only the transcript is saved with the session.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-foreground/80">STT language hint:</span>
                  <select
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                    value={sttLanguage}
                    onChange={(e) =>
                      setSttLanguage(e.target.value === "ar" ? "ar" : "auto")
                    }
                    aria-label="Speech-to-text language hint"
                  >
                    <option value="auto">Auto (recommended)</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={voiceMode === "text" ? "default" : "outline"}
                    onClick={() => setVoiceMode("text")}
                  >
                    Text only
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={voiceMode === "voice" ? "default" : "outline"}
                    onClick={() => setVoiceMode("voice")}
                    disabled={!speechCaps.transcribe}
                  >
                    Voice primary
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={voiceMode === "both" ? "default" : "outline"}
                    onClick={() => setVoiceMode("both")}
                  >
                    Both
                  </Button>
                </div>
                {speechCaps.tts ? (
                  <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setAudioUnlocked(true);
                        setVoiceHint(null);
                      }}
                    >
                      Enable recruiter voice
                    </Button>
                    <label className="inline-flex cursor-pointer items-center gap-2 text-foreground/90">
                      <input
                        type="checkbox"
                        className="rounded border-input"
                        checked={autoPlayRecruiter}
                        onChange={(e) => setAutoPlayRecruiter(e.target.checked)}
                        disabled={!audioUnlocked}
                      />
                      Auto-play recruiter replies (after you unlock audio)
                    </label>
                  </div>
                ) : null}
                {voiceMode !== "text" && speechCaps.transcribe ? (
                  <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                    {voicePhase === "idle" ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => void startRecording()}
                        disabled={busy || !sessionStarted}
                      >
                        <Mic className="mr-1.5 h-3.5 w-3.5" />
                        Record answer
                      </Button>
                    ) : null}
                    {voicePhase === "recording" ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => stopRecording()}
                        >
                          <Square className="mr-1.5 h-3.5 w-3.5" />
                          Stop &amp; send
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => cancelRecording()}
                        >
                          <MicOff className="mr-1.5 h-3.5 w-3.5" />
                          Cancel
                        </Button>
                      </>
                    ) : null}
                    {voicePhase === "uploading" ? (
                      <span className="inline-flex items-center gap-2 text-foreground/90">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Transcribing…
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {!speechCaps.transcribe ? (
                  <p className="border-t border-border/60 pt-3 text-amber-900/90 dark:text-amber-100/90">
                    Speech-to-text unavailable: set{" "}
                    <code className="text-foreground/80">OPENAI_API_KEY</code> or{" "}
                    <code className="text-foreground/80">GROQ_API_KEY</code>.
                  </p>
                ) : null}
                {voiceHint ? (
                  <p
                    className="text-[0.8125rem] font-medium text-amber-900 dark:text-amber-100"
                    role="status"
                  >
                    {voiceHint}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              {voiceMode !== "voice" ? (
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your answer as you would on a live HR screen…"
                  className="min-h-[96px] flex-1 resize-none"
                  disabled={busy || !sessionStarted}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendUserMessage();
                    }
                  }}
                  aria-label="Your interview answer"
                />
              ) : (
                <p className="min-h-[96px] flex-1 rounded-xl border border-dashed border-border/90 bg-muted/20 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  Voice primary: use <span className="font-medium text-foreground">Record answer</span>{" "}
                  above, or switch to <span className="font-medium text-foreground">Both</span>{" "}
                  to type your reply.
                </p>
              )}
              <Button
                type="button"
                className="sm:h-[96px] sm:w-28"
                onClick={() => void sendUserMessage()}
                disabled={
                  busy ||
                  !sessionStarted ||
                  !input.trim() ||
                  voiceMode === "voice"
                }
              >
                {status === "streaming" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                Send
              </Button>
            </div>
          </div>
        </Card>
        <div className="space-y-4">
          <ScorePanel score={score} />
        </div>
      </div>
    </div>
  );
}
