import { Hono } from "hono";
import { deleteCookie } from "hono/cookie";
import { hashPassword, verifyPassword } from "../lib/password";
import { COOKIE_NAME, issueSession, requireUser, type Env } from "../lib/session";

const auth = new Hono<Env>();

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
};

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

auth.get("/me", requireUser, async (c) => {
  const user = await c.env.DB.prepare(
    "SELECT id, email, name, created_at FROM users WHERE id = ?",
  )
    .bind(c.get("userId"))
    .first<Omit<UserRow, "password_hash">>();
  if (!user) return c.json({ error: "not authenticated" }, 401);
  return c.json(user);
});

export default auth;
