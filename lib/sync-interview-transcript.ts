import type { ChatMessage } from "@/types/chat";

/** Push user/assistant lines to Postgres for dashboard history + message counts. Text-only payloads (voice interviews store transcripts, never audio blobs). */
export async function syncInterviewTranscriptToServer(
  sessionId: string,
  messages: ChatMessage[],
): Promise<void> {
  const payload = messages
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") && m.content.trim().length > 0,
    )
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content.trim(),
    }));
  if (payload.length === 0) return;

  await fetch(`/api/interview/session/${encodeURIComponent(sessionId)}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: payload }),
    cache: "no-store",
  });
}
