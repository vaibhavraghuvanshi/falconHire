export type LlmProviderId = "openai" | "groq" | "anthropic";

export type ResolvedLlmConfig =
  | {
      provider: "openai";
      apiKey: string;
      baseUrl?: string;
      model: string;
    }
  | {
      provider: "groq";
      apiKey: string;
      baseUrl: string;
      model: string;
    }
  | {
      provider: "anthropic";
      apiKey: string;
      model: string;
    };

const GROQ_DEFAULT_BASE = "https://api.groq.com/openai/v1";

function trimEnv(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v || undefined;
}

function buildOpenAI(): ResolvedLlmConfig | null {
  const apiKey = trimEnv("OPENAI_API_KEY");
  if (!apiKey) return null;
  return {
    provider: "openai",
    apiKey,
    baseUrl: trimEnv("OPENAI_BASE_URL"),
    model: trimEnv("LLM_MODEL_OPENAI") ?? "gpt-4o-mini",
  };
}

function buildGroq(): ResolvedLlmConfig | null {
  const apiKey = trimEnv("GROQ_API_KEY");
  if (!apiKey) return null;
  return {
    provider: "groq",
    apiKey,
    baseUrl: trimEnv("GROQ_BASE_URL") ?? GROQ_DEFAULT_BASE,
    model: trimEnv("LLM_MODEL_GROQ") ?? "llama-3.3-70b-versatile",
  };
}

function buildAnthropic(): ResolvedLlmConfig | null {
  const apiKey = trimEnv("ANTHROPIC_API_KEY");
  if (!apiKey) return null;
  return {
    provider: "anthropic",
    apiKey,
    model: trimEnv("LLM_MODEL_ANTHROPIC") ?? "claude-haiku-4-5-20251001",
  };
}

/**
 * Resolves which LLM backend to use. Set `LLM_PROVIDER` to `openai`, `groq`, or
 * `anthropic`. When unset, order is OpenAI → Groq → Anthropic based on which API
 * key is present (matches typical local setups that only have `OPENAI_API_KEY`).
 */
export function resolveLlmConfig(): ResolvedLlmConfig | null {
  const explicit = trimEnv("LLM_PROVIDER")?.toLowerCase() as
    | LlmProviderId
    | undefined;

  if (explicit === "openai") return buildOpenAI();
  if (explicit === "groq") return buildGroq();
  if (explicit === "anthropic") return buildAnthropic();

  return buildOpenAI() ?? buildGroq() ?? buildAnthropic();
}

export function isLlmConfigured(): boolean {
  return resolveLlmConfig() !== null;
}
