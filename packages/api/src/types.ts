export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  /** Service Binding to the atomik-cqrs event-store Worker (ADR-003 Option D). */
  EVENTS: Fetcher;
};
