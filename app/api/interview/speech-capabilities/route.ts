import { NextResponse } from "next/server";
import {
  isSpeechTranscribeConfigured,
  isSpeechTtsConfigured,
} from "@/lib/speech/config";
import { requireUser } from "@/lib/require-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Which voice features are available for the signed-in user (drives UI toggles).
 */
export async function GET() {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  return NextResponse.json(
    {
      transcribe: isSpeechTranscribeConfigured(),
      tts: isSpeechTtsConfigured(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
