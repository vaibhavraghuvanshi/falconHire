import { NextResponse } from "next/server";
import {
  extractJsonText,
  isLlmConfigured,
  llmCompleteText,
  llmMissingEnvMessage,
  resolveLlmConfig,
} from "@/lib/llm";
import { LINKEDIN_SYSTEM_PROMPT } from "@/lib/prompts/linkedin";
import type { LinkedInOptimizationResult } from "@/types/chat";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

export const runtime = "nodejs";

type LinkedInBody = {
  currentRole?: string;
  targetRoles?: string;
  yearsExperience?: string;
  skills?: string;
  achievements?: string;
  location?: string;
};

export async function POST(req: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;
  const { userId } = authResult;

  if (!isLlmConfigured()) {
    return NextResponse.json({ error: llmMissingEnvMessage() }, { status: 503 });
  }

  const body = (await req.json()) as LinkedInBody;
  const prompt = [
    `Current title/role: ${body.currentRole ?? "Not provided"}`,
    `Target roles in UAE/GCC: ${body.targetRoles ?? "Not provided"}`,
    `Years of experience: ${body.yearsExperience ?? "Not provided"}`,
    `Key skills: ${body.skills ?? "Not provided"}`,
    `Top achievements (metrics welcome): ${body.achievements ?? "Not provided"}`,
    `Location / mobility: ${body.location ?? "Not provided"}`,
  ].join("\n");

  const config = resolveLlmConfig()!;
  let raw: string;
  try {
    raw = await llmCompleteText(config, {
      system: LINKEDIN_SYSTEM_PROMPT,
      dialogue: [
        {
          role: "user",
          content: `Candidate inputs:\n${prompt}\n\nReturn JSON as specified.`,
        },
      ],
      temperature: 0.45,
      jsonMode: true,
    });
  } catch {
    return NextResponse.json(
      { error: "The model did not return usable LinkedIn copy." },
      { status: 502 },
    );
  }

  if (!raw) {
    return NextResponse.json(
      { error: "No LinkedIn content generated." },
      { status: 502 },
    );
  }

  let result: LinkedInOptimizationResult;
  try {
    result = JSON.parse(extractJsonText(raw)) as LinkedInOptimizationResult;
  } catch {
    return NextResponse.json(
      { error: "Could not parse LinkedIn optimization." },
      { status: 502 },
    );
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.linkedInOptimization.create({
        data: {
          payload: body as object,
          result: result as object,
          userId,
        },
      });
    } catch {
      /* optional */
    }
  }

  return NextResponse.json({ result });
}
