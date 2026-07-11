import { apiFetch } from "./api";
import { getSessionToken } from "./session";
import { DEMO_TENANT_ID } from "./lms";
import { OVERRIDE_MARKER } from "./audit-shared";

export type AuditEvent = {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  data: Record<string, unknown>;
  version: number;
  timestamp: number;
  createdBy: string;
};

async function authedFetch(path: string, init?: RequestInit): Promise<Response | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return apiFetch(path, {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export async function getAuditLog(): Promise<AuditEvent[]> {
  const res = await authedFetch(`/cqrs/events?tenant_id=${DEMO_TENANT_ID}`);
  if (!res?.ok) return [];

  const body = (await res.json()) as {
    events: {
      id: string;
      aggregate_id: string;
      aggregate_type: string;
      event_type: string;
      data: Record<string, unknown>;
      version: number;
      // Postgres BIGINT comes back over JSON as a numeric string (the pg driver avoids JS
      // number-precision loss) — Number() it here so every consumer gets a real number.
      timestamp: number | string;
      created_by: string;
    }[];
  };

  return body.events.map((e) => ({
    id: e.id,
    aggregateId: e.aggregate_id,
    aggregateType: e.aggregate_type,
    eventType: e.event_type,
    data: e.data,
    version: e.version,
    timestamp: Number(e.timestamp),
    createdBy: e.created_by,
  }));
}

// A "journal entry override": a human-authored event appended through the same command path the
// app itself uses, not a raw bypass insert.
export async function createJournalEntry(input: {
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  data: Record<string, unknown>;
}): Promise<{ error?: string }> {
  const res = await authedFetch(`/cqrs/aggregates/${input.aggregateId}/commands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenant_id: DEMO_TENANT_ID,
      aggregate_type: input.aggregateType,
      event_type: input.eventType,
      data: { ...input.data, [OVERRIDE_MARKER]: true },
    }),
  });
  if (!res) return { error: "not authenticated" };
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { error: data.error ?? "failed to add event" };
  }
  return {};
}
