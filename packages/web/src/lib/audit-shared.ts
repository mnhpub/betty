// Marks an event's data as human-authored via the Audit Log modal, not app- or seed-generated —
// there's no dedicated event-store column for this, so it rides along in the generic data blob.
// Split into its own module (no server-only imports) so client components can reference it
// without pulling lib/audit.ts's next/headers dependency into the browser bundle.
export const OVERRIDE_MARKER = "__auditLogOverride";
