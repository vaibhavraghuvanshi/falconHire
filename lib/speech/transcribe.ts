import OpenAI from "openai";
import type { ResolvedSpeechTranscribe } from "@/lib/speech/config";

function getOpenAIClient(config: ResolvedSpeechTranscribe): OpenAI {
  if (config.backend === "groq") {
    return new OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl });
  }
  return new OpenAI({
    apiKey: config.apiKey,
    ...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
  });
}

/**
 * Transcribe a short interview answer clip (WebM/Opus from MediaRecorder is typical).
 */
export async function transcribeInterviewAudio(
  config: ResolvedSpeechTranscribe,
  file: File,
  language?: "en" | "ar",
): Promise<string> {
  const client = getOpenAIClient(config);
  const transcription = await client.audio.transcriptions.create({
    file,
    model: config.model,
    ...(language ? { language } : {}),
  });
  const text = transcription.text?.trim() ?? "";
  return text;
}
