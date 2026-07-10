import fs from "fs";
import path from "path";
import type { Schema } from "./types.js";

class MigrationGenerator {
  private getMigrationNumber(): string {
    const migrationsDir = path.join(process.cwd(), "packages/api/migrations");
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
      return "001";
    }

    const files = fs.readdirSync(migrationsDir);
    const numbers = files
      .map((f) => parseInt(f.split("_")[0]))
      .filter((n) => !isNaN(n));

    const nextNumber = Math.max(0, ...numbers) + 1;
    return String(nextNumber).padStart(3, "0");
  }

  async generateMigrations(
    schemaFile: string,
    sqlFile: string,
    outputDir: string
  ): Promise<void> {
    // Read the SQL schema
    const sql = fs.readFileSync(sqlFile, "utf-8");

    // Create migrations directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate initial migration
    const migrationNumber = this.getMigrationNumber();
    const timestamp = new Date().toISOString().replace(/[^\d]/g, "").slice(0, 14);
    const migrationFile = path.join(
      outputDir,
      `${migrationNumber}_initial_schema_${timestamp}.sql`
    );

    fs.writeFileSync(migrationFile, sql);
    console.log(`✓ Migration created: ${migrationFile}`);
  }
}

export async function generateMigrations(
  schemaFile: string,
  sqlFile: string,
  outputDir: string
): Promise<void> {
  const generator = new MigrationGenerator();
  await generator.generateMigrations(schemaFile, sqlFile, outputDir);
}

// Main execution
async function main() {
  const schemaFile = path.join(process.cwd(), "generated/schema.json");
  const sqlFile = path.join(process.cwd(), "generated/schema.sql");
  const outputDir = path.join(process.cwd(), "../api/migrations");

  await generateMigrations(schemaFile, sqlFile, outputDir);
}

main().catch(console.error);
