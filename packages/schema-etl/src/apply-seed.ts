#!/usr/bin/env tsx
// Applies a YAML-defined seed file directly to an atomik-cqrs `events` table via `pg`.
// Bypasses the deployed WASM /commands route entirely — this is data seeding, not going through
// domain-logic validation, so it can use aggregate/event types the current WASM harness doesn't
// know about yet (DemoWidget is still the only one it can create/replay).
//
// Usage:
//   bun run seed -- --database-url=postgres://... --file=seeds/atomik-cqrs/events.yaml
//   bun run seed -- --database-url=postgres://... --file=seeds/atomik-cqrs/events.yaml --dry-run
//
// Idempotent: event ids are either explicit in the YAML or derived deterministically (sha256 of
// aggregate id + index + event type), and inserts use ON CONFLICT (id) DO NOTHING — safe to
// re-run.

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Client } from "pg";
import { load } from "js-yaml";

interface SeedEvent {
  id?: string;
  type: string;
  timestamp: string;
  data: unknown;
}

interface SeedAggregate {
  id: string;
  type: string;
  created_by: string;
  events: SeedEvent[];
}

interface SeedTenant {
  id: string;
  name?: string;
  aggregates: SeedAggregate[];
}

interface SeedFile {
  tenants: SeedTenant[];
}

function parseArgs(argv: string[]): { databaseUrl: string; file: string; dryRun: boolean } {
  const args = new Map<string, string>();
  let dryRun = false;
  for (const arg of argv) {
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args.set(match[1], match[2]);
  }
  const databaseUrl = args.get("database-url") ?? process.env.ATOMIK_DATABASE_URL;
  const file = args.get("file");
  if (!databaseUrl) throw new Error("--database-url=... (or ATOMIK_DATABASE_URL) is required");
  if (!file) throw new Error("--file=... is required");
  return { databaseUrl, file, dryRun };
}

// Matches the 32-char lowercase-hex-no-hyphens convention used by both the native Zig adapter
// (postgres_pool.uuid_to_hex) and edge/persistence.ts, so seed rows are indistinguishable from
// rows written through either real code path.
function stripHyphens(uuid: string): string {
  const hex = uuid.replace(/-/g, "");
  if (hex.length !== 32) throw new Error(`invalid UUID: ${uuid}`);
  return hex;
}

function deriveEventId(aggregateId: string, index: number, eventType: string): string {
  return createHash("sha256").update(`${aggregateId}:${index}:${eventType}`).digest("hex").slice(0, 32);
}

interface Row {
  id: string;
  tenantId: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  data: unknown;
  version: number;
  timestamp: number;
  createdBy: string;
}

function buildRows(seed: SeedFile): Row[] {
  const rows: Row[] = [];
  for (const tenant of seed.tenants) {
    for (const aggregate of tenant.aggregates) {
      aggregate.events.forEach((event, index) => {
        rows.push({
          id: event.id ? stripHyphens(event.id) : deriveEventId(aggregate.id, index, event.type),
          tenantId: stripHyphens(tenant.id),
          aggregateId: stripHyphens(aggregate.id),
          aggregateType: aggregate.type,
          eventType: event.type,
          data: event.data,
          version: index + 1,
          timestamp: new Date(event.timestamp).getTime(),
          createdBy: stripHyphens(aggregate.created_by),
        });
      });
    }
  }
  return rows;
}

async function main() {
  const { databaseUrl, file, dryRun } = parseArgs(process.argv.slice(2));
  const seed = load(readFileSync(file, "utf8")) as SeedFile;
  const rows = buildRows(seed);

  console.log(`Parsed ${rows.length} event(s) from ${file}`);

  if (dryRun) {
    for (const row of rows) {
      console.log(`  [dry-run] ${row.aggregateType}/${row.eventType} v${row.version} (id=${row.id})`);
    }
    return;
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query("BEGIN");
    let inserted = 0;
    for (const row of rows) {
      const result = await client.query(
        `INSERT INTO events (id, tenant_id, aggregate_id, aggregate_type, event_type, event_data, version, timestamp, created_by)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          row.id,
          row.tenantId,
          row.aggregateId,
          row.aggregateType,
          row.eventType,
          JSON.stringify(row.data),
          row.version,
          row.timestamp,
          row.createdBy,
        ],
      );
      if ((result.rowCount ?? 0) > 0) inserted++;
    }
    await client.query("COMMIT");
    console.log(`Inserted ${inserted} new event(s), skipped ${rows.length - inserted} already-seeded.`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
