# Agent Handoff: Event Store Seed Data

## Purpose

This seed data exists **only** to populate the CQRS event store with realistic domain events.

It is **not** intended to represent production data, nor is it generated through the deployed command API.

Seed data is inserted directly into the `events` table via:

```
schema-etl/src/apply-seed.ts
```

rather than through `POST /cqrs/aggregates/:id/commands`, because `apply-seed.ts` needs deterministic, idempotent bulk inserts (stable IDs, `ON CONFLICT DO NOTHING`) — not because the command API is limited to a specific aggregate. **Correction from an earlier draft of this doc:** the command API is already domain-agnostic (`aggregate_type`/`event_type`/`data` all come from the caller — see `packages/atomik-cqrs/edge/routes.ts`), confirmed live by creating arbitrary event types (e.g. `StatusCheckIn`) through the real deployed endpoint. There is no real business-rule validation in the WASM harness yet ("no real LMS command handlers exist yet" — ADR-002 territory), so the API accepts any well-formed command today. The seed bypass is purely about bulk-load determinism, not a capability gap.

---

# Design Goals

The seed data should:

- demonstrate an event-sourced domain
- contain believable business events
- exercise projections
- exercise aggregate replay
- provide useful query results for humans and AI agents
- remain deterministic and idempotent

It should **not**:

- contain PII
- contain PHI
- contain pastoral or counseling records
- contain customer information
- resemble production exports

---

# Aggregate Layout

```
Tenant
 └── Aggregate (Member)
      ├── Event
      ├── Event
      ├── Event
      └── ...
```

Each aggregate owns a chronological stream.

Example:

```
Tenant
    Example Organization

Aggregate
    Member
        SessionCompleted
        ReflectionLogged
        MilestoneDocumented
        SessionCompleted
        ReflectionLogged
```

---

# Event Store Philosophy

Events represent immutable historical facts.

Events should be named in the past tense.

Good:

- MemberRegistered
- SessionCompleted
- ReflectionLogged
- CompetencyObserved
- CertificateIssued

Avoid CRUD terminology:

- UpdateMember
- SaveMember
- ModifyRecord
- EditMember

---

# Deterministic IDs

Event IDs are optional.

If omitted, `apply-seed.ts` generates a stable identifier:

```
sha256(
    aggregate_id +
    event_index +
    event_type
)
```

(truncated)

This guarantees:

- deterministic output
- idempotent imports
- stable foreign references

Repeated imports should produce identical IDs.

---

# Timestamp Rules

Timestamps should:

- remain chronological
- preserve causal ordering
- be realistic
- avoid future dates unless intentionally testing

Example:

```
10:00 SessionCompleted

10:15 ReflectionLogged

10:20 MilestoneDocumented
```

---

# Event Payload Guidance

Payloads should be:

- realistic
- compact
- business-focused

Avoid:

- personal stories
- names
- addresses
- phone numbers
- emails
- medical information
- counseling notes

Prefer generic placeholders.

Example:

```
reflection_text:
    Participant recorded a summary of the lesson.
```

instead of

```
reflection_text:
    I finally forgave my father...
```

---

# Obfuscation Policy

When publishing examples:

Replace:

- organization names
- UUIDs
- session names
- free-form text
- user identifiers

Keep:

- event ordering
- event types
- aggregate boundaries
- timestamps (optionally shifted together)
- payload structure

The goal is to preserve architecture while removing sensitive semantics.

---

# Seed Data Quality

Good seed data should be interesting enough that:

```
SELECT *
FROM events
ORDER BY timestamp;
```

tells a believable story.

Likewise,

```
SELECT *
FROM member_projection;
```

should resemble a real application rather than synthetic test fixtures.

---

# Projection Expectations

These events should support projections such as:

- Member progress
- Session completion history
- Timeline view
- Activity feed
- Completion statistics
- Aggregate replay
- Audit history

without requiring additional synthetic data.

---

# Future Direction

As real business-rule validation lands in the command handlers (ADR-002), this seed file should become the canonical source for representative domain events, routed through the real write path instead of a direct table insert:

```
Seed YAML
        │
        ▼
Command Generator
        │
        ▼
Command API
        │
        ▼
Aggregate
        │
        ▼
Events
        │
        ▼
Projections
```

instead of writing directly into the event store.

This ensures the seed data exercises the same command validation, business rules, and aggregate logic as production traffic.

---

# Guiding Principle

The purpose of this dataset is **not** to simulate users.

Its purpose is to demonstrate an event-sourced system with clean, replayable business facts that are useful for testing, documentation, and AI-assisted exploration.
