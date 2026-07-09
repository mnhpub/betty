import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

const TOKEN_KEY = "betty_session_token";

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  created_at?: string;
};

// expo-secure-store has no web implementation; fall back to localStorage there
// (web is only used for local smoke-testing, not a real target for this app).
export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") return window.localStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === "web") {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function authFetch(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export async function signup(name: string, email: string, password: string) {
  const { ok, data } = await authFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  if (!ok) throw new Error(data.error ?? "signup failed");
  await setToken(data.token);
  return data.user as ApiUser;
}

export async function login(email: string, password: string) {
  const { ok, data } = await authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!ok) throw new Error(data.error ?? "login failed");
  await setToken(data.token);
  return data.user as ApiUser;
}

export async function logout() {
  await authFetch("/auth/logout", { method: "POST" });
  await clearToken();
}

export async function fetchCurrentUser(): Promise<ApiUser | null> {
  const token = await getToken();
  if (!token) return null;
  const { ok, data } = await authFetch("/auth/me");
  if (!ok) return null;
  return data as ApiUser;
}
