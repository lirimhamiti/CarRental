import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, ADMIN_SESSION_COOKIE } from "@/lib/session-cookie-names";
import type { Role, SubscriptionStatus } from "@/generated/prisma/client";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const ADMIN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export interface SessionUser {
  id: string;
  companyId: string;
  username: string;
  role: Role;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date;
}

// --- Company/staff logins (database-backed) ---

export async function createUserSession(userId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { id: token, userId, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyUserSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { id: token } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: token },
    include: { user: { include: { company: true } } },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return {
    id: session.user.id,
    companyId: session.user.companyId,
    username: session.user.username,
    role: session.user.role,
    subscriptionStatus: session.user.company.subscriptionStatus,
    trialEndsAt: session.user.company.trialEndsAt,
  };
}

// --- Admin login (stateless — signed against env credentials, no DB row) ---

function adminSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return secret;
}

function signAdminToken(expiresAt: number): string {
  const payload = String(expiresAt);
  const signature = crypto.createHmac("sha256", adminSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

function verifyAdminToken(token: string): boolean {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = crypto.createHmac("sha256", adminSecret()).update(payload).digest("hex");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return false;

  return Number(payload) > Date.now();
}

export async function createAdminSession(): Promise<void> {
  const expiresAt = Date.now() + ADMIN_TTL_MS;
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, signAdminToken(expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return token != null && verifyAdminToken(token);
}
