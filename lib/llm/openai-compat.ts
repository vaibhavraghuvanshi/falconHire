import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { ResolvedLlmConfig } from "./config";
import type { DialogueMessage } from "./dialogue";

const clients = new Map<string, OpenAI>();

function cacheKey(c: Extract<ResolvedLlmConfig, { provider: "openai" | "groq" }>) {
  return `${c.provider}:${c.baseUrl ?? ""}:${c.apiKey.slice(0, 8)}`;
}

function getClient(c: Extract<ResolvedLlmConfig, { provider: "openai" | "groq" }>) {
  const key = cacheKey(c);
  let client = clients.get(key);
  if (!client) {
    client = new OpenAI({
      apiKey: c.apiKey,
      baseURL: c.baseUrl,
    });
    clients.set(key, client);
  }
  return client;
}

function toOpenAIMessages(
  system: string,
  dialogue: DialogueMessage[],
): ChatCompletionMessageParam[] {
  return [{ role: "system", content: system }, ...dialogue];
}

export async function openaiCompatStreamChat(
  config: Extract<ResolvedLlmConfig, { provider: "openai" | "groq" }>,
  params: {
    system: string;
    dialogue: DialogueMessage[];
    temperature: number;
  },
): Promise<ReadableStream<Uint8Array>> {
  const client = getClient(config);
  const completion = await client.chat.completions.create({
    model: config.model,
    stream: true,
    temperature: params.temperature,
    messages: toOpenAIMessages(params.system, params.dialogue),
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const part of completion) {
          const token = part.choices[0]?.delta?.content ?? "";
          if (token) controller.enqueue(encoder.encode(token));
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

export async function openaiCompatCompleteText(
  config: Extract<ResolvedLlmConfig, { provider: "openai" | "groq" }>,
  params: {
    system: string;
    dialogue: DialogueMessage[];
    temperature: number;
    jsonMode: boolean;
  },
): Promise<string> {
  const client = getClient(config);
  const completion = await client.chat.completions.create({
    model: config.model,
    temperature: params.temperature,
    response_format: params.jsonMode ? { type: "json_object" } : undefined,
    messages: toOpenAIMessages(params.system, params.dialogue),
  });
  const raw = completion.choices[0]?.message?.content;
  if (typeof raw !== "string" || !raw) {
    throw new Error("Empty completion from OpenAI-compatible provider.");
  }
  return raw;
}
