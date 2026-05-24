import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;
  const { userId } = authResult;

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json(
      { id: null, persisted: false },
      { headers: { "Cache-Control": "no-store, must-revalidate" } },
    );
  }

  let body: { jobDescription?: unknown; title?: unknown };
  try {
    body = (await req.json()) as { jobDescription?: unknown; title?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const jobDescription =
    typeof body.jobDescription === "string" ? body.jobDescription.trim() : "";
  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim()
      : "Mock interview";

  try {
    const session = await prisma.interviewSession.create({
      data: {
        userId,
        title,
        jobDescription: jobDescription || null,
      },
    });
    return NextResponse.json({ id: session.id, persisted: true }, {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not create interview session." },
      { status: 500, headers: { "Cache-Control": "no-store, must-revalidate" } },
    );
  }
}
