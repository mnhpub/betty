#!/usr/bin/env bun
// Seed demo user credentials into the local D1 database via wrangler d1 execute.
//
// Usage: bun scripts/seed-demo.ts

import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const DEMO_CREDENTIALS = {
  email: "demo@example.com",
  password: "demo1234",
  name: "Demo User",
};

// Replicate the password hashing logic from src/lib/password.ts
const ITERATIONS = 100_000;

function toHex(bytes: ArrayBuffer | Uint8Array): string {
  return Array.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function deriveBits(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await deriveBits(password, salt);
  return `${toHex(salt)}:${toHex(derived)}`;
}

async function main() {
  const passwordHash = await hashPassword(DEMO_CREDENTIALS.password);
  const id = crypto.randomUUID();

  // Escape single quotes in strings for SQL
  const escapedHash = passwordHash.replace(/'/g, "''");
  const escapedEmail = DEMO_CREDENTIALS.email.replace(/'/g, "''");
  const escapedName = DEMO_CREDENTIALS.name.replace(/'/g, "''");

  const sql = `INSERT OR IGNORE INTO users (id, email, password_hash, name) VALUES ('${id}', '${escapedEmail}', '${escapedHash}', '${escapedName}');`;

  // Write SQL to temp file
  const sqlFile = join("/tmp", `seed-${Date.now()}.sql`);
  writeFileSync(sqlFile, sql);

  try {
    const proc = Bun.spawnSync(["bunx", "wrangler", "d1", "execute", "betty-api", "--local", "--file", sqlFile], {
      cwd: import.meta.dir,
    });

    if (proc.success) {
      console.log("✅ Demo user created:");
      console.log(`   📧 Email: ${DEMO_CREDENTIALS.email}`);
      console.log(`   🔐 Password: ${DEMO_CREDENTIALS.password}`);
    } else {
      const stderr = new TextDecoder().decode(proc.stderr);
      console.error("❌ Error seeding demo user:");
      console.error(stderr);
      process.exit(1);
    }
  } finally {
    try {
      unlinkSync(sqlFile);
    } catch {}
  }
}

main();
