import { Hono } from "hono";
import type { Bindings } from "../types";

// Passthrough routes proving the Service Binding to the atomik-cqrs event-store Worker
// (ADR-003 Option D) actually works end-to-end from a deployed betty-api. Deliberately thin and
// unauthenticated for now — this validates the binding mechanism, not the real LMS domain
// (ADR-002 territory); requireUser and real event types land when that gets built.
const cqrs = new Hono<{ Bindings: Bindings }>();

cqrs.get("/health", async (c) => {
  const res = await c.env.EVENTS.fetch(new Request("https://events/health"));
  return new Response(res.body, res);
});

cqrs.post("/aggregates/:id/commands", async (c) => {
  const body = await c.req.text();
  const res = await c.env.EVENTS.fetch(
    new Request(`https://events/aggregates/${c.req.param("id")}/commands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }),
  );
  return new Response(res.body, res);
});

cqrs.get("/aggregates/:id/state", async (c) => {
  const tenantId = c.req.query("tenant_id") ?? "";
  const aggregateType = c.req.query("aggregate_type") ?? "";
  const res = await c.env.EVENTS.fetch(
    new Request(
      `https://events/aggregates/${c.req.param("id")}/state?tenant_id=${tenantId}&aggregate_type=${aggregateType}`,
    ),
  );
  return new Response(res.body, res);
});

export default cqrs;
