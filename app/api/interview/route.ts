import { NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  isLlmConfigured,
  llmMissingEnvMessage,
  llmStreamChat,
  partitionOpenAIChatMessages,
  resolveLlmConfig,
} from "@/lib/llm";
import {
  INTERVIEW_SYSTEM_PROMPT,
  interviewPromptAppendices,
} from "@/lib/prompts/interview";
import { requireUser } from "@/lib/require-user";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  if (!isLlmConfigured()) {
    return NextResponse.json({ error: llmMissingEnvMessage() }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { messages, jobDescription: jdRaw } = body as {
    messages?: ChatCompletionMessageParam[];
    jobDescription?: unknown;
  };

  const jobDescription =
    typeof jdRaw === "string" && jdRaw.trim() ? jdRaw.trim() : undefined;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "messages must be a non-empty array." },
      { status: 400 },
    );
  }

  const config = resolveLlmConfig()!;
  const { systemAppendix, dialogue } = partitionOpenAIChatMessages(messages);
  const system = [
    INTERVIEW_SYSTEM_PROMPT,
    interviewPromptAppendices(jobDescription),
    systemAppendix,
  ]
    .filter(Boolean)
    .join("\n\n");

  const stream = await llmStreamChat(config, {
    system,
    dialogue,
    temperature: 0.65,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
