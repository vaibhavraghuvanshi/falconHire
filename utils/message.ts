import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { ChatMessage } from "@/types/chat";

export function toOpenAIMessages(messages: ChatMessage[]) {
  const out: ChatCompletionMessageParam[] = [];
  for (const m of messages) {
    if (m.role === "system") continue;
    if (m.role === "assistant" && !m.content.trim()) continue;
    out.push({
      role: m.role,
      content: m.content,
    });
  }
  return out;
}
