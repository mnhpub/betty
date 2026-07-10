export const API_URL = process.env.API_URL ?? "http://localhost:4000";

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  created_at?: string;
};

export type AuthResponse = { token: string; user: ApiUser } | { error: string };

// Cloudflare blocks a Worker from `fetch()`-ing another Worker's *.workers.dev
// URL directly (error 1042 — workers.dev subdomains are "private"). In the
// deployed Worker, route through the "API" service binding instead, which
// calls betty-api in-process. Gated on CF_DEPLOYMENT (only set in
// wrangler.jsonc's vars) rather than try/catching getCloudflareContext():
// calling it under plain `next dev` doesn't fail cleanly — it auto-spins a
// local Miniflare simulation that collides with the separately-running
// `wrangler dev` for the api package (D1 SQLite lock contention).
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  if (process.env.CF_DEPLOYMENT === "true") {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    if (env.API) {
      return env.API.fetch(new Request(`${API_URL}${path}`, init));
    }
  }
  return fetch(`${API_URL}${path}`, init);
}
