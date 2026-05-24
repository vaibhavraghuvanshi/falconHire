/**
 * Strips optional ```json fences and trims so JSON.parse is more reliable across
 * providers (especially Anthropic, which may wrap JSON in markdown).
 */
export function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/m.exec(trimmed);
  if (fence) return fence[1].trim();
  return trimmed;
}
