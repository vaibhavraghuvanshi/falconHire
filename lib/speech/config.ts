const GROQ_DEFAULT_BASE = "https://api.groq.com/openai/v1";

function trimEnv(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v || undefined;
}

export type SpeechTranscribeBackend = "openai" | "groq";

export type ResolvedSpeechTranscribe =
  | {
      backend: "openai";
      apiKey: string;
      baseUrl?: string;
      model: string;
    }
  | {
      backend: "groq";
      apiKey: string;
      baseUrl: string;
      model: string;
    };

export type ResolvedSpeechTts = {
  apiKey: string;
  baseUrl?: string;
  model: string;
  defaultVoice: string;
};

function buildOpenAiTranscribe(): ResolvedSpeechTranscribe | null {
  const apiKey = trimEnv("OPENAI_API_KEY");
  if (!apiKey) return null;
  return {
    backend: "openai",
    apiKey,
    baseUrl: trimEnv("OPENAI_BASE_URL"),
    model: trimEnv("SPEECH_TRANSCRIBE_MODEL_OPENAI") ?? "whisper-1",
  };
}

function buildGroqTranscribe(): ResolvedSpeechTranscribe | null {
  const apiKey = trimEnv("GROQ_API_KEY");
  if (!apiKey) return null;
  return {
    backend: "groq",
    apiKey,
    baseUrl: trimEnv("GROQ_BASE_URL") ?? GROQ_DEFAULT_BASE,
    model: trimEnv("SPEECH_TRANSCRIBE_MODEL_GROQ") ?? "whisper-large-v3-turbo",
  };
}

/**
 * Prefer OpenAI Whisper when `OPENAI_API_KEY` is set; otherwise Groq’s OpenAI-compatible speech API.
 */
export function resolveSpeechTranscribeConfig(): ResolvedSpeechTranscribe | null {
  return buildOpenAiTranscribe() ?? buildGroqTranscribe();
}

/** OpenAI speech synthesis (no Groq TTS in this MVP). */
export function resolveSpeechTtsConfig(): ResolvedSpeechTts | null {
  const apiKey = trimEnv("OPENAI_API_KEY");
  if (!apiKey) return null;
  return {
    apiKey,
    baseUrl: trimEnv("OPENAI_BASE_URL"),
    model: trimEnv("SPEECH_TTS_MODEL") ?? "tts-1",
    defaultVoice: trimEnv("SPEECH_TTS_VOICE") ?? "alloy",
  };
}

export function isSpeechTranscribeConfigured(): boolean {
  return resolveSpeechTranscribeConfig() !== null;
}

export function isSpeechTtsConfigured(): boolean {
  return resolveSpeechTtsConfig() !== null;
}

export function speechTranscribeMissingMessage(): string {
  return "Speech-to-text is not configured. Set OPENAI_API_KEY or GROQ_API_KEY.";
}

export function speechTtsMissingMessage(): string {
  return "Recruiter voice playback is not configured. Set OPENAI_API_KEY for OpenAI TTS.";
}

/** OpenAI `tts-1` / `tts-1-hd` voices (see OpenAI speech docs). */
const TTS_VOICES = new Set([
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
]);

export function normalizeTtsVoice(raw: unknown, fallback: string): string {
  if (typeof raw !== "string" || !TTS_VOICES.has(raw)) return fallback;
  return raw;
}
