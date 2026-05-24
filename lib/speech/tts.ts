import OpenAI from "openai";
import type { ResolvedSpeechTts } from "@/lib/speech/config";

export async function synthesizeInterviewSpeech(
  config: ResolvedSpeechTts,
  params: { text: string; voice: string },
): Promise<ArrayBuffer> {
  const client = new OpenAI({
    apiKey: config.apiKey,
    ...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
  });

  const response = await client.audio.speech.create({
    model: config.model,
    voice: params.voice as
      | "alloy"
      | "echo"
      | "fable"
      | "onyx"
      | "nova"
      | "shimmer",
    input: params.text,
    response_format: "mp3",
  });

  return response.arrayBuffer();
}
