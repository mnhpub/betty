"use server";

import { redirect } from "next/navigation";
import { apiFetch, type AuthResponse } from "@/lib/api";
import { setSessionToken } from "@/lib/session";
import { currentLocale } from "@/lib/i18n/server-locale";

export type AuthActionState = { error?: string };

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
