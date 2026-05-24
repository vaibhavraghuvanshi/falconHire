import { NextResponse } from "next/server";
import {
  resolveSpeechTranscribeConfig,
  speechTranscribeMissingMessage,
} from "@/lib/speech/config";
import { INTERVIEW_AUDIO_MAX_BYTES } from "@/lib/speech/constants";
import { transcribeInterviewAudio } from "@/lib/speech/transcribe";
import { requireUser } from "@/lib/require-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const config = resolveSpeechTranscribeConfig();
  if (!config) {
    return NextResponse.json(
      { error: speechTranscribeMissingMessage() },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing audio file field `file`." },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0) {
    return NextResponse.json({ error: "Empty audio upload." }, { status: 400 });
  }
  if (buf.length > INTERVIEW_AUDIO_MAX_BYTES) {
    return NextResponse.json(
      {
        error: `Audio exceeds max size (${Math.floor(INTERVIEW_AUDIO_MAX_BYTES / (1024 * 1024))} MB).`,
      },
      { status: 413 },
    );
  }

  const langRaw = form.get("language");
  const language = langRaw === "ar" ? ("ar" as const) : undefined;

  const name = typeof file.name === "string" && file.name ? file.name : "answer.webm";
  const type =
    typeof file.type === "string" && file.type.length > 0
      ? file.type
      : "audio/webm";
  const upload = new File([buf], name, { type });

  try {
    const text = await transcribeInterviewAudio(config, upload, language);
    if (!text) {
      return NextResponse.json(
        { error: "No speech detected. Try again closer to the mic." },
        { status: 422 },
      );
    }
    return NextResponse.json({ text }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Transcription failed. Check API keys and try again." },
      { status: 502 },
    );
  }
}
