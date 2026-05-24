import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getOwnerUserIdsForSession } from "@/lib/session-owner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store, must-revalidate" } as const;

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized", connected: false, interviews: [] },
      { status: 401, headers: noStore },
    );
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json(
      { connected: false, interviews: [] },
      { headers: noStore },
    );
  }

  const ownerIds = await getOwnerUserIdsForSession(session);
  if (ownerIds.length === 0) {
    return NextResponse.json(
      { connected: true, interviews: [] },
      { headers: noStore },
    );
  }

  try {
    const interviews = await prisma.interviewSession.findMany({
      where: { userId: { in: ownerIds } },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        createdAt: true,
        score: true,
        _count: { select: { messages: true } },
      },
    });
    return NextResponse.json(
      { connected: true, interviews },
      { headers: noStore },
    );
  } catch {
    return NextResponse.json(
      { connected: true, interviews: [], error: "Unable to read history." },
      { status: 200, headers: noStore },
    );
  }
}
