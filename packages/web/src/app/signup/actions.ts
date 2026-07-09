"use server";

import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { setSessionToken } from "@/lib/session";

export type AuthActionState = { error?: string };

export async function signup(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "");

  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();

  if (!res.ok) {
    return { error: data.error ?? "signup failed" };
  }

  await setSessionToken(data.token);
  redirect("/dashboard");
}
