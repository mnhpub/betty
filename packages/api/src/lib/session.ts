import { type Context, type Next } from "hono";
import { sign, verify } from "hono/jwt";
import { getCookie, setCookie } from "hono/cookie";
import type { Bindings } from "../types";

export const COOKIE_NAME = "betty_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type Env = { Bindings: Bindings; Variables: { userId: string } };

export function bearerToken(c: Context): string | null {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

export async function issueSession(c: Context<Env>, userId: string): Promise<string> {
  const token = await sign(
    { sub: userId, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS },
    c.env.JWT_SECRET,
    "HS256",
  );
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: new URL(c.req.url).protocol === "https:",
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return token;
}

export async function requireUser(c: Context<Env>, next: Next) {
  const token = getCookie(c, COOKIE_NAME) ?? bearerToken(c);
  if (!token) return c.json({ error: "not authenticated" }, 401);

  try {
    const payload = await verify(token, c.env.JWT_SECRET, "HS256");
    c.set("userId", payload.sub as string);
    await next();
  } catch {
    return c.json({ error: "not authenticated" }, 401);
  }
}
