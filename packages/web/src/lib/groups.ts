import { apiFetch } from "./api";
import { getSessionToken } from "./session";

export type ApiGroup = {
  id: string;
  name: string;
  type: string;
  status: "active" | "waitlist" | "archived";
  member_count: number;
  leader: string | null;
};

export type ApiGroupType = { id: string; name: string };

async function authedFetch(path: string, init?: RequestInit): Promise<Response | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return apiFetch(path, {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export async function listGroups(): Promise<ApiGroup[]> {
  const res = await authedFetch("/groups");
  if (!res?.ok) return [];
  return res.json();
}

export async function listGroupTypes(): Promise<ApiGroupType[]> {
  const res = await authedFetch("/groups/types");
  if (!res?.ok) return [];
  return res.json();
}

export async function createGroup(name: string, groupTypeId: string): Promise<{ error?: string }> {
  const res = await authedFetch("/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, groupTypeId }),
  });
  if (!res) return { error: "not authenticated" };
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { error: data.error ?? "failed to create group" };
  }
  return {};
}
