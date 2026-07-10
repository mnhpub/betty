"use server";

import { redirect } from "next/navigation";
import { apiFetch, type AuthResponse } from "@/lib/api";
import { setSessionToken } from "@/lib/session";
import { currentLocale } from "@/lib/i18n/server-locale";

export type AuthActionState = { error?: string };

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "demo1234";
const DEMO_NAME = "Demo User";

export async function login(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const res = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as AuthResponse;

  if (!res.ok || "error" in data) {
    return { error: "error" in data ? data.error : "login failed" };
  }

  await setSessionToken(data.token);
  redirect(`/${await currentLocale()}/dashboard`);
}

// Dev convenience: logs into a fixed demo account, creating it on first use.
// Lets anyone hit "Try the demo" locally without needing seeded credentials.
export async function demoLogin(
  _prevState: AuthActionState,
  _formData: FormData,
): Promise<AuthActionState> {
  const credentials = { email: DEMO_EMAIL, password: DEMO_PASSWORD };

  let res = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (res.status === 401) {
    res = await apiFetch("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...credentials, name: DEMO_NAME }),
    });
  }

  const data = (await res.json()) as AuthResponse;

  if (!res.ok || "error" in data) {
    return { error: "error" in data ? data.error : "demo login failed" };
  }

  await setSessionToken(data.token);
  redirect(`/${await currentLocale()}/dashboard`);
}
