import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "wp_admin";
const TWO_WEEKS = 60 * 60 * 24 * 14;

export function adminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function passwordsMatch(input: string, expected: string): boolean {
  const left = createHash("sha256").update(input).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

function sessionValue(password: string): string {
  return createHmac("sha256", password).update("washington-prayer-admin").digest("hex");
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function setAdminCookie(): Promise<void> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, sessionValue(password), cookieOptions(TWO_WEEKS));
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, "", cookieOptions(0));
}

export async function isAdmin(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE)?.value;
  if (!value) return false;
  const left = createHash("sha256").update(value).digest();
  const right = createHash("sha256").update(sessionValue(password)).digest();
  return timingSafeEqual(left, right);
}
