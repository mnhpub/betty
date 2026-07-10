# ADR-001: Where does "phase" (journey stage) live — member, group, or both?

## Status
Accepted (2026-07-10) — Option C. Schema landed in `packages/api/migrations/0002_groups_membership_lms.sql`.

## Date
2026-07-09

## Context

Betty's domain centers on a discipleship/recovery-style program with a 5-phase journey:
**discipleship → deliverance → beyond → walking → sharing**.

Confirmed product requirements that this decision must not break (from Linear TPOF backlog and prior scoping):

- Members can hold **multiple simultaneous group memberships**.
- Leaders can manage **multiple groups**.
- Groups are **archived**, not deleted, and archived data must remain available for reporting.
- **Membership history** is tracked (a member's participation over time).
- **Custom LMS** content (video, transcripts, quizzes, PDFs) needs to be assigned to a stage of curriculum.

The open question, flagged during initial scoping and left unresolved: is "phase" a property of the **member** (their personal journey progress), the **group** (what stage of curriculum a cohort is currently running), or **both**, with different meanings? This wasn't answerable from the initial ask ("monorepo with app/web/api") — it only surfaced once Linear planning got into the domain model.

This is a schema-shaping decision. Getting it wrong means a migration and rework of Groups/Membership/RBAC after they're already built on top of it — the kind of decision that's expensive to reverse.

## Decision

**Option C**, accepted 2026-07-10. `users.journey_phase` (personal journey milestone) and `groups.curriculum_phase` (what the group's cohort is currently covering) are separate, decoupled fields — no automatic reconciliation between them. Group roles (Leader/Member) are scoped per `group_type` rather than global, following the Rock RMS `GroupType`/`GroupTypeRole` pattern, which also settles TPOF-4/TPOF-15 (RBAC roles) as a side effect rather than a separate decision.

## Options Considered

### Option A — Member-level only
`members.journey_phase` tracks each individual's personal stage. Groups have no phase of their own.

- **Pros:** Matches the reality that a person's journey is personal and continues independently of which group(s) they're currently in. Cleanly supports multiple simultaneous group memberships — a member's phase isn't ambiguous when they belong to two groups. Membership history can show phase progression as a personal timeline.
- **Cons:** Gives no way to represent "what curriculum stage is this group currently teaching," which the custom LMS needs for content sequencing at the group/cohort level.
- **Rejected if:** LMS content must be assignable to a group's current teaching stage independent of any one member's progress.

### Option B — Group-level only
`groups.curriculum_phase` tracks what stage a cohort is running. Members implicitly inherit phase from whichever group they're in.

- **Pros:** Simple, single source of truth. Matches LMS content mapping directly — assign modules to a group's phase, the whole cohort progresses together.
- **Cons:** Breaks down immediately under multiple simultaneous group memberships — if a member is in a Discipleship group and a Recovery group at different phases, "the member's phase" is undefined. Loses the personal-journey narrative that's central to a discipleship/recovery program. Membership history/reporting can't show individual growth independent of whatever cohort a member happens to be sitting in.
- **Rejected because:** it directly conflicts with the confirmed multi-group-membership requirement, not just a hypothetical edge case.

### Option C — Both, decoupled
`members.journey_phase` (personal journey milestone) and `groups.curriculum_phase` (what the group's cohort is currently covering) exist as two separate, unrelated fields.

- **Pros:** Matches both real-world facts without conflating them. LMS content targets `groups.curriculum_phase`. Membership history and personal reporting key off `members.journey_phase` transitions over time. A leader can see both "where is this member in their journey" and "what is this group covering this week" — which are genuinely different questions in this domain.
- **Cons:** More schema surface area — two similarly-named concepts (`journey_phase` vs `curriculum_phase`) risk being conflated by future engineers or agents if not named and documented clearly from the start. No automatic reconciliation between the two (e.g., nothing stops a member whose `journey_phase` is "walking" from joining a group whose `curriculum_phase` is "discipleship" — that may be desired flexibility or may need a validation rule later).

## Recommendation

**Option C.** It's the only option that doesn't silently violate the multi-group-membership requirement (Option B) or lose the ability to sequence LMS content per group cohort (Option A). The added complexity is manageable as long as the two fields are named distinctly (`journey_phase` on members, `curriculum_phase` on groups) and documented as intentionally decoupled from the start, rather than discovered as a bug later.

## Consequences (if Option C is accepted)

- TPOF-11 (ERD) models two phase-like enum fields instead of one: `members.journey_phase` and `groups.curriculum_phase`, both backed by the same 5-value enum (discipleship, deliverance, beyond, walking, sharing).
- TPOF-6 (Custom LMS) module assignment keys off `groups.curriculum_phase`.
- TPOF-3 (Membership) history/reporting keys off `members.journey_phase` transitions.
- No automatic constraint links a member's `journey_phase` to the `curriculum_phase` of groups they join, at least initially — if leaders want that as guidance or a hard rule (e.g., "recommend groups matching a member's phase"), that's a separate future decision, not blocking ERD.
- This ADR's status moves to **Accepted** once explicitly confirmed; if a different option is chosen instead, a new ADR should supersede this one rather than editing it in place.
