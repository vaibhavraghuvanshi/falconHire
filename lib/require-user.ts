import { auth } from "@/auth";
import { resolveCanonicalUserId } from "@/lib/session-owner";
import { NextResponse } from "next/server";

export type AuthUserResult =
  | { userId: string }
  | { error: NextResponse };

/**
 * Prefer Prisma `User.id` resolved by email so API writes match rows created by
 * the Prisma adapter (JWT `sub` can theoretically diverge in edge setups).
 */
export async function requireUser(): Promise<AuthUserResult> {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const userId = await resolveCanonicalUserId(session);
  if (!userId) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { userId };
}
