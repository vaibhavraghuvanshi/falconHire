import { NextResponse } from "next/server";
import {
  extractJsonText,
  isLlmConfigured,
  llmCompleteText,
  llmMissingEnvMessage,
  resolveLlmConfig,
} from "@/lib/llm";
import { RESUME_SYSTEM_PROMPT } from "@/lib/prompts/resume";
import type { ResumeAnalysisResult } from "@/types/chat";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

export const runtime = "nodejs";

async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (file.type === "text/plain" || name.endsWith(".md")) {
    return file.text();
  }
  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy().catch(() => undefined);
    return result.text.slice(0, 24_000);
  }
  throw new Error(
    "Unsupported format. Upload PDF or plain text (.txt / .md).",
  );
}

export async function POST(req: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;
  const { userId } = authResult;

  if (!isLlmConfigured()) {
    return NextResponse.json({ error: llmMissingEnvMessage() }, { status: 503 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  let resumeText = "";
  let fileName: string | null = null;

  if (contentType.includes("application/json")) {
    const json = (await req.json()) as { text?: string };
    resumeText = json.text?.trim() ?? "";
  } else {
    const form = await req.formData();
    const file = form.get("file");
    const pasted = form.get("text");
    if (typeof pasted === "string" && pasted.trim()) {
      resumeText = pasted.trim();
    }
    if (file instanceof File && file.size > 0) {
      fileName = file.name;
      resumeText = (await extractText(file)).trim();
    }
  }

  if (!resumeText || resumeText.length < 40) {
    return NextResponse.json(
      {
        error:
          "Please provide at least a few lines of resume content or upload a PDF/TXT file.",
      },
      { status: 400 },
    );
  }

  const config = resolveLlmConfig()!;
  let raw: string;
  try {
    raw = await llmCompleteText(config, {
      system: RESUME_SYSTEM_PROMPT,
      dialogue: [{ role: "user", content: `Resume text:\n${resumeText}` }],
      temperature: 0.25,
      jsonMode: true,
    });
  } catch {
    return NextResponse.json(
      { error: "The model did not return a usable resume analysis." },
      { status: 502 },
    );
  }

  if (!raw) {
    return NextResponse.json(
      { error: "No analysis generated." },
      { status: 502 },
    );
  }

  let result: ResumeAnalysisResult;
  try {
    result = JSON.parse(extractJsonText(raw)) as ResumeAnalysisResult;
  } catch {
    return NextResponse.json(
      { error: "Could not parse resume analysis." },
      { status: 502 },
    );
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.resumeAnalysis.create({
        data: {
          fileName,
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
