import type { Session } from "next-auth";
import { getPrisma } from "@/lib/prisma";

/**
 * Canonical Prisma User id for this signed-in session (prefer email lookup).
 */
export async function resolveCanonicalUserId(
  session: Session | null,
): Promise<string | null> {
  if (!session?.user) return null;
  const prisma = getPrisma();
  if (prisma && session.user.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (dbUser) return dbUser.id;
  }
  return session.user.id ?? null;
}

/**
 * All user id values that might appear on InterviewSession.userId for this
 * account (JWT id vs Prisma User.id drift).
 */
export async function getOwnerUserIdsForSession(
  session: Session | null,
): Promise<string[]> {
  if (!session?.user) return [];
  const ids = new Set<string>();
  if (session.user.id) ids.add(session.user.id);
  const prisma = getPrisma();
  if (prisma && session.user.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (dbUser) ids.add(dbUser.id);
  }
  return Array.from(ids);
}
