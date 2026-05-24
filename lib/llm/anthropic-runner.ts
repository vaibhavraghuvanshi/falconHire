import Anthropic from "@anthropic-ai/sdk";
import type { ResolvedLlmConfig } from "./config";
import type { DialogueMessage } from "./dialogue";
import { toAnthropicMessageParams } from "./dialogue";

const clients = new Map<string, Anthropic>();

function getAnthropicClient(apiKey: string) {
  let c = clients.get(apiKey);
  if (!c) {
    c = new Anthropic({ apiKey });
    clients.set(apiKey, c);
  }
  return c;
}

export async function anthropicStreamChat(
  config: Extract<ResolvedLlmConfig, { provider: "anthropic" }>,
  params: {
    system: string;
    dialogue: DialogueMessage[];
    temperature: number;
  },
): Promise<ReadableStream<Uint8Array>> {
  const client = getAnthropicClient(config.apiKey);
  const { system, messages } = toAnthropicMessageParams(
    params.system,
    params.dialogue,
  );

  const stream = client.messages.stream({
    model: config.model,
    max_tokens: 8192,
    system,
    messages,
    temperature: params.temperature,
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (e) {
        controller.enqueue(
          encoder.encode(
            "\n\n[Stream interrupted. Please retry your last message.]",
          ),
        );
        console.error(e);
      } finally {
        controller.close();
      }
    },
  });
}

export async function anthropicCompleteText(
  config: Extract<ResolvedLlmConfig, { provider: "anthropic" }>,
  params: {
    system: string;
    dialogue: DialogueMessage[];
    temperature: number;
    jsonMode: boolean;
  },
): Promise<string> {
  const client = getAnthropicClient(config.apiKey);
  const jsonHint = params.jsonMode
    ? "\n\nReturn valid JSON only with no markdown fences or commentary."
    : "";
  const { system, messages } = toAnthropicMessageParams(
    `${params.system}${jsonHint}`,
    params.dialogue,
  );

  const msg = await client.messages.create({
    model: config.model,
    max_tokens: 8192,
    system,
    messages,
    temperature: params.temperature,
  });

  const parts: string[] = [];
  for (const block of msg.content) {
    if (block.type === "text") {
      parts.push(block.text);
    }
  }
  const text = parts.join("");

  if (!text) {
    throw new Error("Empty completion from Anthropic.");
  }
  return text;
}
