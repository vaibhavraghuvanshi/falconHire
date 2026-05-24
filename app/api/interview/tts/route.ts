import { NextResponse } from "next/server";
import {
  normalizeTtsVoice,
  resolveSpeechTtsConfig,
  speechTtsMissingMessage,
} from "@/lib/speech/config";
import { INTERVIEW_TTS_MAX_CHARS } from "@/lib/speech/constants";
import { synthesizeInterviewSpeech } from "@/lib/speech/tts";
import { requireUser } from "@/lib/require-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const config = resolveSpeechTtsConfig();
  if (!config) {
    return NextResponse.json({ error: speechTtsMissingMessage() }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const raw = body as { text?: unknown; voice?: unknown };
  if (typeof raw.text !== "string" || !raw.text.trim()) {
    return NextResponse.json({ error: "`text` must be a non-empty string." }, { status: 400 });
  }

  const text = raw.text.trim();
  if (text.length > INTERVIEW_TTS_MAX_CHARS) {
    return NextResponse.json(
      {
        error: `Text exceeds max length (${INTERVIEW_TTS_MAX_CHARS} characters).`,
      },
      { status: 413 },
    );
  }

  const voice = normalizeTtsVoice(raw.voice, config.defaultVoice);

  try {
    const audio = await synthesizeInterviewSpeech(config, { text, voice });
    return new Response(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Text-to-speech failed. Check OPENAI_API_KEY and try again." },
      { status: 502 },
    );
  }
}
