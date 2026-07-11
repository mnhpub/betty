# ADR-002: LMS Domain Model — Research-Validated Schema & Analytics Strategy

## Status
Proposed (2026-07-10)

**Note:** The field names in this ADR describe **read-side projection** schemas (computed read
models built from events). The **write-side event-store catalog** naming was walked back to
domain-agnostic vocabulary in [ADR-004](ADR-004-domain-agnostic-event-catalog-naming.md) to
enable platform reuse. These are separate layers — do not conflate them.

## Date
2026-07-10

## Context

Betty's custom LMS (TPOF-6) backs the "Prayer of Freedom" master class — a spiritual/biblical
teaching program built on a namespace-based domain model:

- `/lms/courses` — course metadata & versioning
- `/lms/courses/{course_id}/sessions` — hierarchical content structure
- `/lms/reference_data/` — extensible taxonomy (biblical verses, "spirit" categories, concepts)
- `/lms/members/{member_id}` — member state, progress, and custom tracking (breakthroughs, prayer
  applications, spirit inventory)
- `/lms/reporting/` — analytics layer

External research was commissioned to validate this design against general LMS architecture
practice, comparable biblical/spiritual education platforms (BiblicalTraining.org, BibleProject.org,
Online Bible Institute, Ethnos360, AWKNG), and learning-analytics literature, and to identify gaps
before the schema is finalized in TPOF-11 (ERD) and TPOF-6 (Custom LMS) implementation.

## Decision

Adopt the following as the working direction for TPOF-6/TPOF-11, pending explicit accept:

### 1. Architecture — validated, no change
Namespace separation (courses / sessions / reference_data / members / reporting) matches standard
LMS service-boundary practice and should hold up if any namespace later needs to split into an
independent service (course content is expected to stay far more stable than member/enrollment
traffic, which spikes during enrollment periods).

### 2. Domain model — extend member/concept tracking

```typescript
// Extend existing concept_tracking
concept_tracking: {
  concept_id: {
    exposures: number,          // existing
    quiz_scores: number[],      // existing
    workbook_attempts: number,  // existing
    scroll_engagement: number,  // NEW — % of page scrolled where concept appears
    highlight_count: number,    // NEW
    discussion_mentions: number,// NEW
    mastery_level: "novice" | "competent" | "advanced"  // NEW — derived from scores
  }
}

// New: spirit-type identification tracking (domain-specific, not found in
// competitor platforms — this is the differentiating taxonomy)
spirit_tracking: {
  spirit_id: {
    identification_attempts: number,
    identification_accuracy: number,
    exposure_sources: string[],       // e.g. ["Session 2", "discussion_post_123"]
    personal_resonance: "low" | "medium" | "high",  // member self-assessment
    application_count: number
  }
}

// New: engagement segmentation for content/communication tuning
engagement_profile: {
  profile_type: "video-learner" | "reader" | "interactive" | "community-focused",
  content_preference_score: Record<string, number>,
  optimal_session_length: "short" | "medium" | "deep",
  peer_learning_preference: "independent" | "small-group" | "large-community"
}

// Enhance: breakthrough tracking becomes a timeline, not a counter
freedom_breakthroughs_timeline: Array<{
  date: string,
  session_id: string,
  spirit_type: string,
  narrative: string,
  emotional_valence: "uncertain" | "hopeful" | "liberated",
  follow_up_prayers: number,
  related_concepts: string[]
}>
```

### 2b. Event-sourcing backend — see [[ADR-003]]
The command/write side (member events like breakthroughs, prayer applications, quiz attempts)
and the read-side projections above are CQRS-shaped enough that they're being evaluated against
`atomik-cqrs` (an event-sourcing runtime the org already owns) rather than hand-rolled. Deployment
topology (native service + Postgres vs. WASM-in-Worker) is tracked separately in
[ADR-003](ADR-003-atomik-cqrs-event-sourcing-backend.md) since it's an infrastructure decision in
its own right, not a schema one.

### 3. Analytics — three-layer reporting model
Descriptive (completion rates, time spent), diagnostic (concept-level quiz failure correlation,
engagement heat maps), and predictive (churn risk, disengagement risk, peer-leadership readiness)
layers on top of `/lms/reporting/`, delivered in phases (see Consequences).

### 4. Engagement metrics to instrument
- Tier 1 (weekly): session completion rate, time-to-completion velocity, session start latency
  (24–48hr start correlates with completion — leading indicator worth alerting on).
- Tier 2 (monthly): assessment performance by concept, repeat participation rate, content
  engagement heat map.
- Tier 3 (quarterly, domain-specific): freedom breakthrough velocity, prayer application logging
  depth, spirit identification engagement.

### 5. Automation rules (candidate, not yet built)
```
IF enrolled but not started within 48h        → send first-session preview email
IF completed session 1 but drops before 3     → send encouragement / mid-course check-in
                                                  (flagged as highest churn point)
IF 0 prayer application logs after 2 sessions → suggest logging one this week
IF high engagement but low completion         → flag possible content overload, offer pacing help
```

## Options Considered

This research validates the existing model rather than choosing between competing architectures,
so there isn't a rejected-alternative set in the usual ADR sense. The one real fork is scope:

### Option A — Ship schema as originally scoped, treat analytics as future work
- **Pros:** Smaller TPOF-11/TPOF-6 surface area now; avoids speculative fields.
- **Cons:** `spirit_tracking` and `freedom_breakthroughs_timeline` are the platform's actual
  differentiators (no competitor tracks this); retrofitting them after member data exists means a
  backfill/migration instead of a clean start.

### Option B — Adopt the extended schema now, defer analytics *dashboards* to later phases
- **Pros:** Data model captures the richer shape from day one (cheap now, expensive later); actual
  dashboards/predictive modeling can roll out incrementally without another schema change.
- **Cons:** More fields to design and document up front; some (`engagement_profile`,
  `mastery_level`) are derived/computed and need a decision on whether they're stored or computed
  on read.

**Recommendation: Option B.** Schema shape is cheap to get right before data exists and expensive
after; dashboard/automation rollout can genuinely wait.

## Consequences

- TPOF-11 (ERD) should include `spirit_tracking`, `engagement_profile`, and
  `freedom_breakthroughs_timeline` as first-class member sub-structures, not bolted on later.
- Open question carried from [[ADR-001]]: whether `concept_tracking`/`spirit_tracking` key off
  `members.journey_phase`, `groups.curriculum_phase`, or neither — not resolved by this research,
  should be settled alongside ERD work.
- Derived fields (`mastery_level`, `content_preference_score`) need an explicit decision:
  stored-and-recomputed vs. computed-on-read. Not yet decided.
- Data sensitivity: prayer applications and breakthrough narratives are personal spiritual content.
  Recommend encryption at rest for `freedom_breakthroughs_timeline` and `spirit_tracking`
  free-text fields, member-level delete capability, and role-based access (members see their own
  data; admins see aggregates only) — not FERPA-driven, but treated with equivalent care.
- Proposed phased rollout (not yet committed to a timeline):
  1. Descriptive reporting + core event instrumentation (views, quiz attempts, time spent).
  2. Diagnostic reports (concept-level quiz correlation, engagement heat maps) + cohort segmentation.
  3. Predictive models (churn risk, breakthrough progression) + adaptive recommendations.
  4. A/B content testing, peer mentorship matching, automated feedback loops.
- This ADR should move to **Accepted** once the schema additions are confirmed for TPOF-11, or be
  superseded if the extended fields are descoped.

## Source
Synthesized from an external LMS domain-model research report (LMS architecture patterns,
biblical/spiritual platform benchmarking, engagement/retention metrics, and learning-analytics
framework) commissioned 2026-07-10. Full report content condensed above; raw report not checked
into the repo.
