import type { ResolvedLlmConfig } from "./config";
import {
  anthropicCompleteText,
  anthropicStreamChat,
} from "./anthropic-runner";
import {
  openaiCompatCompleteText,
  openaiCompatStreamChat,
} from "./openai-compat";
import type { DialogueMessage } from "./dialogue";

export async function llmStreamChat(
  config: ResolvedLlmConfig,
  params: {
    system: string;
    dialogue: DialogueMessage[];
    temperature: number;
  },
): Promise<ReadableStream<Uint8Array>> {
  if (config.provider === "anthropic") {
    return anthropicStreamChat(config, params);
  }
  return openaiCompatStreamChat(config, params);
}

export async function llmCompleteText(
  config: ResolvedLlmConfig,
  params: {
    system: string;
    dialogue: DialogueMessage[];
    temperature: number;
    jsonMode: boolean;
  },
): Promise<string> {
  if (config.provider === "anthropic") {
    return anthropicCompleteText(config, params);
  }
  return openaiCompatCompleteText(config, params);
}

export function llmMissingEnvMessage(): string {
  return "Configure an LLM: set OPENAI_API_KEY, GROQ_API_KEY, or ANTHROPIC_API_KEY. Optional: LLM_PROVIDER=openai|groq|anthropic, plus model overrides (LLM_MODEL_OPENAI, LLM_MODEL_GROQ, LLM_MODEL_ANTHROPIC).";
}
