# v0.1.0

First tagged release of the Betty monorepo scaffold — intended as a reusable
template baseline (Hono/Bun API + Next.js web + Expo app, all TSX/bun,
Cloudflare-hosted).

## Features

- **Monorepo scaffold** — bun workspaces across `packages/api` (Hono on Bun),
  `packages/web` (Next.js), `packages/app` (Expo / React Native), no
  Turborepo, no shared packages.
- **Auth** — email/password signup, login, logout, session-check (`/me`),
  JWT session cookie (httpOnly, 7-day TTL) via Cloudflare D1 + Wrangler,
  wired end-to-end into both web and the Expo app.
- **Groups** — create and list groups scoped by `group_type`
  (discipleship / recovery / walking / deliverance / sharing); creator is
  auto-assigned the Leader role; list view shows member count and leader.
- **Group-scoped roles** — Leader/Member roles are scoped per `group_type`
  (Rock RMS–style `GroupType`/`GroupTypeRole` pattern) rather than a global
  RBAC table (ADR-001, accepted).
- **Journey/curriculum phase model** — decoupled `users.journey_phase`
  (member's personal stage) from `groups.curriculum_phase` (cohort's stage),
  plus a `phase_history` audit table.
- **LMS schema** — `lms_modules` (video/transcript/quiz/pdf) and
  `lms_completions` tables in place (schema only, see limitations).
- **Web UI** — Carbon Design System theming (replaced Tailwind), responsive
  mobile nav, en/es i18n routing.
- **Design sync** — Carbon component subset synced to Claude Design, project
  pinned for ongoing design-sync.
- **Testing** — Playwright e2e suite covering auth flow, responsive nav, and
  i18n routing.
- **Build tooling** — root Makefile wrapping per-package bun scripts
  (install/build/build-api/build-web/build-app/clean); Cloudflare deploy
  scripts (`wrangler deploy`, `opennextjs-cloudflare deploy`) present.

## Known limitations

- **LMS has no API or UI** — schema exists, but no routes or screens serve
  or track module content yet.
- **No RBAC enforcement** — Leader/Member is assigned on group creation, but
  no route checks differentiate what a Leader vs. Member can do; any
  authenticated user can list/create groups.
- **No group edit/archive/delete** — only create + list endpoints exist.
- **No membership management endpoints** — schema supports
  pending/waitlist/active status and re-join history via `left_at`, but
  there's no API to join, leave, or move between states.
- **Scope gaps vs. product vision** — no in-app messaging, no real-time
  features (PartyKit not yet integrated), no geolocation-based group
  discovery, no scheduling/one-time events.
- **Mobile app is auth-only** — Expo app has login/signup/home screens, no
  parity with web's groups/LMS features.
- **No phase-transition UI** — journey/curriculum phase fields exist in the
  schema but nothing lets a user or leader change them yet.
- **Auth is minimal** — email/password only, no OAuth/SSO, no password
  reset, no email verification.
- **No CI/CD pipeline** — deploy scripts exist but aren't wired into
  automated CI.
- **Build artifacts must stay gitignored** — `.open-next/` build output was
  briefly committed (containing a live API key) before being caught by
  GitHub push protection and fixed; template consumers should verify their
  own `.gitignore` covers build directories before their first push.
