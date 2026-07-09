"use server";

import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { setSessionToken } from "@/lib/session";

export type AuthActionState = { error?: string };

export async function login(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (!res.ok) {
    return { error: data.error ?? "login failed" };
  }

  await setSessionToken(data.token);
  redirect("/dashboard");
}
