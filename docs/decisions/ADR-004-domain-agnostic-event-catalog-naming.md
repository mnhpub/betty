# ADR-004: Domain-agnostic event and field naming for the event store master schema

## Status
Proposed (2026-07-11)

## Date
2026-07-11

## Context

[ADR-003](ADR-003-atomik-cqrs-event-sourcing-backend.md) accepted a hybrid architecture for the
LMS event store — atomik-cqrs's Zig aggregate logic as WASM in a dedicated Worker, with
persistence reimplemented in TypeScript against Hyperdrive/Postgres, reached via Service Binding.

The concrete event *catalog* that data flows through — the "master schema" the CQRS layer works
from — lives in `packages/schema-etl/seeds/atomik-cqrs/events.yaml`. This is the first time
Betty is deliberately changing that schema after related ADRs were already accepted. This
warrants proper ADR ceremony rather than a silent rename, to establish precedent for how we
handle naming walkbacks that touch accepted decisions.

Investigation of the codebase found:
- `packages/atomik-cqrs` (vendored Zig/WASM library) is already fully domain-agnostic — its
  `DomainEvent` struct, Postgres `init.sql` schema, and edge routes take `aggregate_type` /
  `event_type` / `data` from the caller with no hardcoded LMS concepts.
- `packages/api`'s CQRS routes pass aggregates through without naming assumptions.
- `packages/web` (lms.ts, audit.ts, JourneyTimeline.tsx) is fully generic — `formatEventType` is
  a regex camelCase-splitter, and the demo tenant/aggregate are referenced by UUID only. **No
  application code needs to change.**
- `packages/schema-etl/src/apply-seed.ts` has zero domain-specific identifiers
  (`SeedEvent`, `SeedAggregate`, `deriveEventId`, etc.) — already generic by design.

The domain-specific vocabulary (`spirit_type`, `emotional_valence`, `FreedomBreakthroughDocumented`,
`PrayerApplicationLogged`) exists **only** in `events.yaml`'s content.

A significant find: `packages/schema-etl/AGENTS.md` (the seed-data design philosophy document)
already illustrates a "good event name" example sequence — `SessionCompleted → ReflectionLogged →
MilestoneDocumented`, with a `reflection_text` field — that maps almost 1:1 onto the real seed's
domain-specific sequence. The generic vocabulary was anticipated in-house; this change aligns the
actual seed with a convention that already exists on paper.

## Decision

Rename the event-store write-side catalog to use domain-agnostic naming, reusing the vocabulary
already suggested in `schema-etl/AGENTS.md`. This covers:
- Event type names (`PrayerApplicationLogged` → `ReflectionLogged`,
  `FreedomBreakthroughDocumented` → `MilestoneDocumented`).
- Payload field names (`spirit_type` → `category`, `emotional_valence` → `outcome`,
  `follow_up_prayers` → `follow_up_actions`, `related_concepts` → `related_topics`,
  `application_text` → `reflection_text`).
- Seed data identifiers and values (tenant name, illustrative payload values).

**Explicit scope:** This ADR covers only the **event-store write-side catalog** (event names,
payload field names, seed content). It does **not** rename [ADR-002](ADR-002-lms-domain-model-research-synthesis.md)'s
read-side projection field names (`spirit_tracking`, `concept_tracking`, `engagement_profile`,
`freedom_breakthroughs_timeline`) — those live on a separate layer (computed read models) and
remain a Proposed concern in ADR-002. The two layers must not be conflated.

## Options Considered

### Option A — Rename to domain-agnostic vocabulary (selected)
Adopt the naming mapping from `schema-etl/AGENTS.md`'s illustrative examples. The vocabulary
already exists in-house as a convention; aligning the real seed brings consistency and enables
the event-store catalog to scale to new domains without renaming.

- **Pros:** Reuses an existing in-house convention rather than inventing new names; unblocks the
  platform from being locked into Prayer of Freedom domain concepts; low blast radius (only
  `events.yaml` content and seed data change; no application code affected).
- **Cons:** Changes deterministic event IDs (sha256 derivation includes event type), so old seeded
  rows won't auto-upgrade; re-seeding required in dev environment.

### Option B — Leave domain-specific naming as-is
Accept the current naming as permanent, building the read models around it later.

- **Pros:** Avoids the re-seed cost now.
- **Cons:** Locks the platform into Prayer of Freedom domain semantics; any future domain (another
  prayer/spiritual practice LMS, a secular leadership course, etc.) must either rename everything
  or duplicate the schema. Contradicts the stated goal of ADR-003 to make Betty a reusable
  platform.
- **Rejected:** The motivation for [ADR-001](ADR-001-phase-model-member-vs-group.md) (decoupling
  phase models) and [ADR-003](ADR-003-atomik-cqrs-event-sourcing-backend.md) (choosing a
  domain-agnostic event store architecture) both assume the domain-specific vocabulary is a
  reversible choice, not a permanent constraint.

## Consequences

- ADR-003's Consequences section currently states "[ADR-002](ADR-002-lms-domain-model-research-synthesis.md)'s
  member-event fields (`freedom_breakthroughs_timeline`, `spirit_tracking`, quiz attempts) become
  the concrete `DomainEvent` payloads for this store." This is now inaccurate for the write-side
  catalog (the payload *envelopes* remain unchanged; only the illustrative field names within the
  `data` JSON have changed). A pointer note has been added to ADR-003's Consequences clarifying
  that the actual event-store catalog naming was superseded by this ADR.
- ADR-002 is still Proposed and contains field names (`spirit_tracking`, `engagement_profile`,
  etc.) that describe read-side projections. A clarifying note has been added to ADR-002 stating
  these are read-model concerns, separate from the write-side schema now governed by this ADR.
- The dev Postgres event store must be re-seeded with the new event type names, since the
  deterministic ID derivation (`sha256(aggregateId:index:eventType)`) changes. Old rows won't be
  overwritten by `ON CONFLICT (id) DO NOTHING`, so a truncate is necessary. This is safe because
  `schema-etl/AGENTS.md` explicitly states the seed data is illustrative, not production.
- The tenant and aggregate UUIDs in the dev seed remain stable — the demo-tenant and demo-member
  UUIDs in `packages/web/src/lib/lms.ts` (hardcoded `DEMO_TENANT_ID`, `DEMO_MEMBER_ID`) do not
  change, so the Journey (`/journeys`) and Audit Log pages will continue to resolve.
- No application code changes are required. `packages/schema-etl/src/apply-seed.ts` was reviewed
  and confirmed already domain-agnostic — no changes needed there.
- If ADR-002 advances from Proposed to Accepted and defines read-model field names, those names
  should remain consistent with the write-side catalog vocabulary established here (e.g. a
  read-model projection of `ReflectionLogged` events might be named `reflection_history` or
  similar, not `prayer_application_log`). This ADR should be cross-referenced when ADR-002 is
  accepted.

## Why this now

This change was prompted by the need to walk back domain-specific naming after ADR-003 was
already accepted. The first time you refactor accepted decisions, establishing process and
ceremony matters more than the change itself — it signals that naming is a reversible choice,
not a permanent constraint, and creates a reusable pattern for future schema evolutions. Doing
this work explicitly (via ADR) rather than silently (via commit comment) makes the decision
discoverable and auditable.
