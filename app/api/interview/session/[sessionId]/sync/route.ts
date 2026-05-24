import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { getOwnerUserIdsForSession } from "@/lib/session-owner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const { sessionId } = await context.params;
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session id." }, { status: 400 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 },
    );
  }

  const session = await auth();
  const ownerIds = session?.user
    ? await getOwnerUserIdsForSession(session)
    : [];
  if (ownerIds.length === 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const owned = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId: { in: ownerIds } },
  });
  if (!owned) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  let body: { messages?: unknown };
  try {
    body = (await req.json()) as { messages?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const raw = body.messages;
  if (!Array.isArray(raw)) {
    return NextResponse.json(
      { error: "messages must be an array." },
      { status: 400 },
    );
  }

  const normalized: { role: string; content: string }[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as { role?: unknown; content?: unknown };
    if (r.role !== "user" && r.role !== "assistant") continue;
    if (typeof r.content !== "string") continue;
    const trimmed = r.content.trim();
    if (!trimmed) continue;
    normalized.push({ role: r.role, content: trimmed });
  }

  if (normalized.length === 0) {
    return NextResponse.json(
      { error: "No valid messages to persist." },
      { status: 400 },
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.interviewMessage.deleteMany({ where: { sessionId } });
      const base = Date.now();
      await tx.interviewMessage.createMany({
        data: normalized.map((m, i) => ({
          sessionId,
          role: m.role,
          content: m.content,
          createdAt: new Date(base + i),
        })),
      });
    });

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(
      { ok: true, count: normalized.length },
      { headers: { "Cache-Control": "no-store, must-revalidate" } },
    );
  } catch {
    return NextResponse.json({ error: "Sync failed." }, { status: 500 });
  }
}
