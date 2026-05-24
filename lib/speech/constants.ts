/** Max upload size for interview audio transcription (bytes). */
export const INTERVIEW_AUDIO_MAX_BYTES = 8 * 1024 * 1024;

/** Max characters sent to recruiter TTS (OpenAI limit is 4096). */
export const INTERVIEW_TTS_MAX_CHARS = 4_000;

/** English-first STT/TTS for GCC mock screens; Arabic can be added when providers support it reliably. */
export const INTERVIEW_VOICE_DEFAULT_LANGUAGE = "en" as const;
