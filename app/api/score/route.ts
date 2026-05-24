import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  extractJsonText,
  isLlmConfigured,
  llmCompleteText,
  llmMissingEnvMessage,
  resolveLlmConfig,
} from "@/lib/llm";
import { buildJobDescriptionAppendix } from "@/lib/prompts/interview";
import { GCC_SCORE_APPENDIX } from "@/lib/prompts/gcc-hiring-context";
import { SCORE_SYSTEM_PROMPT } from "@/lib/prompts/score";
import type { RecruiterScore } from "@/types/chat";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { getOwnerUserIdsForSession } from "@/lib/session-owner";

export const runtime = "nodejs";

function parseScore(raw: string): RecruiterScore {
  const parsed = JSON.parse(extractJsonText(raw)) as RecruiterScore;
  if (
    typeof parsed.overall !== "number" ||
    !parsed.categories ||
    !Array.isArray(parsed.strengths)
  ) {
    throw new Error("Malformed score payload");
  }
  return parsed;
}

export async function POST(req: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  if (!isLlmConfigured()) {
    return NextResponse.json({ error: llmMissingEnvMessage() }, { status: 503 });
  }

  const body = (await req.json()) as {
    messages?: ChatCompletionMessageParam[];
    sessionId?: string;
    jobDescription?: unknown;
  };

  const jobDescription =
    typeof body.jobDescription === "string" && body.jobDescription.trim()
      ? body.jobDescription.trim()
      : undefined;
  const jdAppendix = buildJobDescriptionAppendix(jobDescription);

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json(
      { error: "messages must be a non-empty array." },
      { status: 400 },
    );
  }

  const transcript = body.messages
    .map((m) => {
      const content =
        "content" in m && typeof m.content === "string" ? m.content : "";
      return `${m.role.toUpperCase()}: ${content}`;
    })
    .join("\n");

  const config = resolveLlmConfig()!;
  const system = [SCORE_SYSTEM_PROMPT, GCC_SCORE_APPENDIX, jdAppendix]
    .filter(Boolean)
    .join("\n\n");

  let raw: string;
  try {
    raw = await llmCompleteText(config, {
      system,
      dialogue: [
        {
          role: "user",
          content: `Transcript:\n${transcript}\n\nReturn JSON as specified.`,
        },
      ],
      temperature: 0.3,
      jsonMode: true,
    });
  } catch {
    return NextResponse.json(
      { error: "The scoring model did not return a usable response." },
      { status: 502 },
    );
  }

  if (!raw) {
    return NextResponse.json(
      { error: "No score generated." },
      { status: 502 },
    );
  }

  let score: RecruiterScore;
  try {
    score = parseScore(raw);
  } catch {
    return NextResponse.json(
      { error: "Could not parse recruiter score." },
      { status: 502 },
    );
  }

  const prisma = getPrisma();
  if (prisma && body.sessionId) {
    try {
      const session = await auth();
      const ownerIds = session?.user
        ? await getOwnerUserIdsForSession(session)
        : [];
      const owned = await prisma.interviewSession.findFirst({
        where: { id: body.sessionId, userId: { in: ownerIds } },
      });
      if (owned) {
        await prisma.interviewSession.update({
          where: { id: owned.id },
          data: { score: score as object },
        });
      }
    } catch {
      /* optional persistence */
    }
  }

  return NextResponse.json({ score });
}
