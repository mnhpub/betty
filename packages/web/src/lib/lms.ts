import { apiFetch } from "./api";
import { getSessionToken } from "./session";

export type JourneyEvent = {
  eventType: string;
  version: number;
  data: Record<string, unknown>;
};

export type MemberJourney = {
  aggregateId: string;
  version: number;
  eventCount: number;
  state: Record<string, unknown>;
  events: JourneyEvent[];
};

// Placeholder demo identity — no real membership/enrollment data model exists yet
// (TPOF-3/TPOF-6 are still backlog). This is the one Prayer of Freedom member seeded via
// packages/schema-etl, not tied to the logged-in user.
export const DEMO_TENANT_ID = "4f994dbe-05a1-4212-840e-0c2fb7a8dc24";
const DEMO_MEMBER_ID = "eebfd535-ba64-4b87-a0f4-dbed1826e126";

async function authedFetch(path: string, init?: RequestInit): Promise<Response | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return apiFetch(path, {
    ...init,
    headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export async function getMemberJourney(): Promise<MemberJourney | null> {
  const res = await authedFetch(
    `/cqrs/aggregates/${DEMO_MEMBER_ID}/state?tenant_id=${DEMO_TENANT_ID}&aggregate_type=Member`,
  );
  if (!res?.ok) return null;

  const body = (await res.json()) as {
    aggregate_id: string;
    version: number;
    event_count: number;
    state: Record<string, unknown>;
    events: { event_type: string; version: number; data: Record<string, unknown> }[];
  };

  return {
    aggregateId: body.aggregate_id,
    version: body.version,
    eventCount: body.event_count,
    state: body.state,
    events: body.events.map((e) => ({ eventType: e.event_type, version: e.version, data: e.data })),
  };
}
