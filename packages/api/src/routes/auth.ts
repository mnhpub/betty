import { Hono, type Context } from "hono";
import { sign, verify } from "hono/jwt";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { hashPassword, verifyPassword } from "../lib/password";
import type { Bindings } from "../types";

const auth = new Hono<{ Bindings: Bindings }>();

const COOKIE_NAME = "betty_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
};

function bearerToken(c: Context): string | null {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

async function issueSession(c: Context<{ Bindings: Bindings }>, userId: string): Promise<string> {
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

auth.post("/signup", async (c) => {
  const body = await c.req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!email || !name || password.length < 8) {
    return c.json({ error: "email, name, and password (min 8 chars) are required" }, 400);
  }

  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) {
    return c.json({ error: "an account with this email already exists" }, 409);
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  await c.env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)",
  )
    .bind(id, email, passwordHash, name)
    .run();

  const token = await issueSession(c, id);
  return c.json({ token, user: { id, email, name } }, 201);
});

auth.post("/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return c.json({ error: "email and password are required" }, 400);
  }

  const user = await c.env.DB.prepare(
    "SELECT id, email, name, password_hash, created_at FROM users WHERE email = ?",
  )
    .bind(email)
    .first<UserRow>();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return c.json({ error: "invalid email or password" }, 401);
  }

  const token = await issueSession(c, user.id);
  return c.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

auth.post("/logout", async (c) => {
  deleteCookie(c, COOKIE_NAME, { path: "/" });
  return c.json({ ok: true });
});

auth.get("/me", async (c) => {
  const token = getCookie(c, COOKIE_NAME) ?? bearerToken(c);
  if (!token) return c.json({ error: "not authenticated" }, 401);

  try {
    const payload = await verify(token, c.env.JWT_SECRET, "HS256");
    const user = await c.env.DB.prepare(
      "SELECT id, email, name, created_at FROM users WHERE id = ?",
    )
      .bind(payload.sub as string)
      .first<Omit<UserRow, "password_hash">>();
    if (!user) return c.json({ error: "not authenticated" }, 401);
    return c.json(user);
  } catch {
    return c.json({ error: "not authenticated" }, 401);
  }
});

export default auth;
