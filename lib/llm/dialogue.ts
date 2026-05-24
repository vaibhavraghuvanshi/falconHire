import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

export type DialogueMessage = { role: "user" | "assistant"; content: string };

function mergeConsecutive(items: DialogueMessage[]): DialogueMessage[] {
  const out: DialogueMessage[] = [];
  for (const item of items) {
    const prev = out[out.length - 1];
    if (prev && prev.role === item.role) {
      prev.content = `${prev.content}\n\n${item.content}`;
    } else {
      out.push({ ...item });
    }
  }
  return out;
}

/**
 * Splits OpenAI-style chat params into optional extra system text and a merged
 * user/assistant dialogue (Anthropic-compatible).
 */
export function partitionOpenAIChatMessages(
  messages: ChatCompletionMessageParam[],
): { systemAppendix: string; dialogue: DialogueMessage[] } {
  const systemParts: string[] = [];
  const raw: DialogueMessage[] = [];

  for (const m of messages) {
    if (m.role === "system" && "content" in m && typeof m.content === "string") {
      systemParts.push(m.content);
      continue;
    }
    if (
      (m.role === "user" || m.role === "assistant") &&
      "content" in m &&
      typeof m.content === "string"
    ) {
      raw.push({ role: m.role, content: m.content });
    }
  }

  return {
    systemAppendix: systemParts.join("\n\n"),
    dialogue: mergeConsecutive(raw),
  };
}

/**
 * Anthropic requires the first message to be from the user. If the transcript
 * starts with assistant (common in this app), fold those into the system block.
 */
export function toAnthropicMessageParams(
  system: string,
  dialogue: DialogueMessage[],
): { system: string; messages: MessageParam[] } {
  let augmentedSystem = system;
  const msgs: DialogueMessage[] = [...dialogue];

  while (msgs[0]?.role === "assistant") {
    const opening = msgs.shift();
    if (!opening) break;
    augmentedSystem = `${augmentedSystem}\n\nInterviewer (already shown in the thread):\n${opening.content}`;
  }

  if (msgs.length === 0) {
    msgs.push({
      role: "user",
      content:
        "Continue the interview as the interviewer with the next question or follow-up.",
    });
  }

  return {
    system: augmentedSystem,
    messages: msgs as MessageParam[],
  };
}
