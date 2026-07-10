# ADR-003: Event-sourcing backend for LMS member events (atomik-cqrs)

## Status
Accepted (2026-07-10) — Option D, implemented against a fork.

## Date
2026-07-10

## Context

[ADR-002](ADR-002-lms-domain-model-research-synthesis.md) identifies the LMS member-tracking
domain as naturally CQRS-shaped: writes are discrete member events (breakthrough logged, prayer
application logged, quiz attempt submitted, session viewed) and reads are projections/aggregates
(`concept_tracking`, `spirit_tracking`, `engagement_profile`, cohort dashboards) built from those
events.

`git@github.com:opengineorg/atomik-cqrs.git` — a Zig event-sourcing runtime the org already
owns — is a candidate implementation rather than something to build from scratch. Relevant
properties (from its own README and `docs/adr/decisions.md`):

- Event store with optimistic concurrency control via `UNIQUE(tenant_id, aggregate_id, version)`
  (their ADR-05) — fits Betty's multi-tenant shape (groups/members) directly.
- Pluggable storage: a PostgreSQL adapter via `libpq` (native C library, parameterized queries
  only — their ADR-03/ADR-07) and an in-memory adapter for tests. No SQLite/D1 adapter exists.
- Snapshotting as a separate vtable for long-lived aggregates (their ADR-09).
- A `wasm32-freestanding` build target with a Cloudflare Workers harness (`edge/`), matching
  Betty's existing Workers deployment (`packages/api` runs on Workers with a D1 binding, per
  `wrangler.jsonc`).

Betty's `api` currently persists to Cloudflare **D1**, not Postgres. Adopting atomik-cqrs as-is
means introducing Postgres as a second datastore, unless/until a D1 adapter is built for it.

## Decision

**Option D**, accepted 2026-07-10. atomik-cqrs's Zig aggregate/command-handling logic runs as
WASM inside its own dedicated Worker; persistence is implemented in TypeScript against a
Hyperdrive-pooled Postgres connection (bypassing atomik's libpq-based `EventStoreAdapter`); the
Betty `api` Worker reaches this event-store Worker via a Service Binding.

Implementation proceeds against a fork, `git@github.com:mnhpub/atomik-cqrs.git`
(fork of `opengineorg/atomik-cqrs`), not the upstream repo directly. This is expected to require
changes upstream doesn't currently have a reason to carry on its own — e.g. WASM exports needed to
drive aggregate replay from a TS-side persistence layer instead of their native `ConnectionPool`,
and possibly build/target adjustments for the dedicated-Worker deployment shape. Where a change is
generally useful (not Betty-specific), it should go back upstream as a PR against
`opengineorg/atomik-cqrs` rather than living only in the fork indefinitely — see Consequences.

**Ruled out: running atomik-cqrs's Postgres adapter as WASM inside the Workers edge harness
(Option A).**
Confirmed directly from atomik-cqrs's own source comment (`edge/worker_main.zig`): the edge
harness is explicitly "a test harness that proves the library builds and runs at the edge... no
real DB connection is possible from a demo running purely in the Worker's WASM sandbox." Their
`ConnectionPool`/libpq path depends on native OS socket syscalls that `wasm32-freestanding` does
not have. Cloudflare Hyperdrive does not remove this constraint by itself — Hyperdrive requires
the caller to speak Workers' `connect()` socket API (via a JS-level driver), and libpq has no way
to invoke that from inside the WASM sandbox. Someone would need to build a socket-proxy shim
(structurally similar to the `fill_random_bytes` WASM import already used for entropy) before the
edge/WASM path could persist anything for real — that shim doesn't exist upstream today.

## Options Considered

### Option A — atomik-cqrs as WASM inside the Betty `api` Worker, backed by Postgres via Hyperdrive
- **Pros:** No new deployable service; event store co-located with `api`, matching the existing
  edge/WASM harness atomik-cqrs already ships.
- **Cons:** Blocked on the socket-proxy shim described above — not a config change, a build. Also
  introduces Postgres (via Hyperdrive) as a second database alongside D1.
- **Rejected for now:** not buildable without upstream (or Betty-side) work on atomik-cqrs itself.

### Option B — atomik-cqrs as a native service, Postgres as its dedicated store
Run atomik-cqrs compiled natively (not WASM) as its own process (VM/container/Fly.io/etc.),
talking directly to Postgres via libpq — the path their own integration tests already exercise
(ADR-07). Betty's `api` Worker calls it over HTTP for commands, and queries read models either
directly in Postgres (via Hyperdrive from the Worker) or via projections synced into D1.
- **Pros:** Uses atomik-cqrs exactly as built and tested upstream; no experimental WASM-socket
  work required. Hyperdrive has a real, well-supported job here — pooling the `api` Worker's
  *read-side* queries into Postgres — rather than trying to tunnel libpq through it.
- **Cons:** A new deployable service to operate, plus Postgres as a second datastore alongside D1.
  Command latency now includes a hop from Worker → event-store service. **This hop cannot be a
  Cloudflare Service Binding** — Service Bindings only dispatch Worker-to-Worker (or
  Worker-to-Durable-Object) calls within the same account; they don't reach an off-platform native
  process. `api` would need plain HTTP (or a private network path) to reach it either way.

### Option C — Don't adopt atomik-cqrs; hand-roll event sourcing directly on D1
- **Pros:** Single datastore (D1), no new service, no Postgres/Hyperdrive dependency.
- **Cons:** Rebuilds OCC, snapshotting, and multi-tenancy primitives that atomik-cqrs already has
  tested — exactly the effort the org built atomik-cqrs to avoid duplicating.

### Option D — Split: WASM for domain logic, TypeScript+Hyperdrive for persistence, reached via Service Binding (selected)
Run atomik-cqrs's Zig aggregate/command-handling logic as WASM inside its own dedicated Worker
(reusing the `edge/` harness pattern), but bypass their libpq-based `EventStoreAdapter` entirely —
implement the actual Postgres reads/writes in TypeScript against a Hyperdrive-pooled connection
(e.g. `postgres.js`), since JS can call Workers' `connect()` socket API where Zig-compiled-to-WASM
cannot. Betty's `api` Worker calls this event-store Worker via a **Service Binding** — no public
network hop, no separate service to deploy or operate.
- **Pros:** Everything stays on Cloudflare's platform — no VM/container to run. Service Binding
  gives near-zero call overhead versus HTTP. Hyperdrive does the job it's actually built for.
- **Cons:** Doesn't reuse atomik-cqrs's own Postgres adapter/integration tests (ADR-07 in their
  repo) — the storage layer gets reimplemented in TS against the same event schema, which is real
  engineering effort and a second implementation to keep in sync with their `EventStoreAdapter`
  vtable contract if it changes upstream.

## Why Option D over B

Option D was chosen over Option B because it keeps Betty entirely on Cloudflare's platform — no
VM/container to provision or operate — and the Service Binding call path has near-zero overhead
versus HTTP to an off-platform service. The accepted cost is real: the persistence layer is
reimplemented in TypeScript rather than reusing atomik-cqrs's tested libpq adapter, and the
implementation lives on a fork rather than upstream until (and unless) the general-purpose parts
land back in `opengineorg/atomik-cqrs`.

## Consequences

- [ADR-002](ADR-002-lms-domain-model-research-synthesis.md)'s member-event fields
  (`freedom_breakthroughs_timeline`, `spirit_tracking`, quiz attempts) become the concrete
  `DomainEvent` payloads for this store.
- Adds Postgres as a second database alongside D1 — real operational cost (hosting, backups,
  migrations) that Betty is now taking on.
- Adds a second *implementation* of the persistence layer (TS/Hyperdrive) that must be kept in
  sync with atomik-cqrs's `EventStoreAdapter` vtable contract and event schema
  (`migrations/*.sql` in their repo) if either changes upstream.
- The fork (`mnhpub/atomik-cqrs`) needs an explicit policy on drift: track which changes are
  Betty-specific (stay fork-only) versus generally useful (should go upstream as a PR to
  `opengineorg/atomik-cqrs`) so the fork doesn't silently diverge and become unmergeable. Revisit
  periodically whether unmerged upstream PRs are stalling and whether that changes the calculus.
- Still open: mapping Betty's tenant concept onto atomik-cqrs's multi-tenancy (likely `group_id`,
  given [ADR-001](ADR-001-phase-model-member-vs-group.md)'s group/member split) — to be resolved
  during implementation, not blocking this ADR's acceptance.
- If atomik-cqrs later ships a native D1 adapter or a WASM socket-proxy shim upstream, Option A
  becomes viable and should be evaluated as a potential successor — this ADR should be superseded
  at that point, not silently ignored.
