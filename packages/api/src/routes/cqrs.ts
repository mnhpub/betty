import { Hono } from "hono";
import { requireUser, type Env } from "../lib/session";

// Passthrough routes to the atomik-cqrs event-store Worker (ADR-003 Option D) via the EVENTS
// Service Binding. /health stays open (pure liveness check, consistent with the root API's own
// unauthenticated /health); the data routes require auth like every other real route.
const cqrs = new Hono<Env>();

cqrs.get("/health", async (c) => {
  const res = await c.env.EVENTS.fetch(new Request("https://events/health"));
  return new Response(res.body, res);
});

cqrs.post("/aggregates/:id/commands", requireUser, async (c) => {
  const body = await c.req.json();
  // user_id must come from the verified session, not the client-supplied body — otherwise
  // any caller could attribute a journal entry to an arbitrary user.
  body.user_id = c.get("userId");
  const res = await c.env.EVENTS.fetch(
    new Request(`https://events/aggregates/${c.req.param("id")}/commands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
  return new Response(res.body, res);
});

cqrs.get("/aggregates/:id/state", requireUser, async (c) => {
  const tenantId = c.req.query("tenant_id") ?? "";
  const aggregateType = c.req.query("aggregate_type") ?? "";
  const res = await c.env.EVENTS.fetch(
    new Request(
      `https://events/aggregates/${c.req.param("id")}/state?tenant_id=${tenantId}&aggregate_type=${aggregateType}`,
    ),
  );
  return new Response(res.body, res);
});

cqrs.get("/events", requireUser, async (c) => {
  const tenantId = c.req.query("tenant_id") ?? "";
  const res = await c.env.EVENTS.fetch(new Request(`https://events/events?tenant_id=${tenantId}`));
  return new Response(res.body, res);
});

export default cqrs;
