import fs from "fs";
import path from "path";
import type { Schema, Table, Column } from "./types.js";

class SQLGenerator {
  generateCreateTableSQL(table: Table): string {
    const lines: string[] = [];
    lines.push(`CREATE TABLE IF NOT EXISTS ${table.name} (`);

    const columnDefs = table.columns.map((col) => this.generateColumnDef(col));
    lines.push(columnDefs.join(",\n  "));

    // Add primary key constraint if not inline
    const pkColumn = table.columns.find((c) => c.primaryKey);
    if (!pkColumn) {
      const idCol = table.columns.find((c) => c.name === "id");
      if (idCol) {
        lines[lines.length - 1] += ",";
        lines.push("  PRIMARY KEY (id)");
      }
    }

    // Add foreign key constraints
    const fkColumns = table.columns.filter((c) => c.foreignKey);
    if (fkColumns.length > 0) {
      fkColumns.forEach((col) => {
        lines[lines.length - 1] += ",";
        const fk = col.foreignKey!;
        lines.push(
          `  FOREIGN KEY (${col.name}) REFERENCES ${fk.table}(${fk.column})`
        );
      });
    }

    lines.push(");");

    return lines.join("\n");
  }

  private generateColumnDef(column: Column): string {
    let def = `  ${column.name} ${this.mapType(column.type)}`;

    if (column.primaryKey) {
      def += " PRIMARY KEY";
    }
    if (!column.nullable) {
      def += " NOT NULL";
    }
    if (column.unique) {
      def += " UNIQUE";
    }

    return def;
  }

  private mapType(type: string): string {
    const typeMap: Record<string, string> = {
      uuid: "TEXT",
      string: "TEXT",
      integer: "INTEGER",
      boolean: "INTEGER",
      timestamp: "TEXT",
      text: "TEXT",
      json: "TEXT",
    };
    return typeMap[type] || "TEXT";
  }

  generateSchema(schema: Schema): string {
    const lines: string[] = [];
    lines.push("-- Generated schema from lms-domain.md");
    lines.push(`-- Generated at: ${schema.generatedAt}`);
    lines.push("-- DO NOT EDIT MANUALLY");
    lines.push("");

    schema.tables.forEach((table) => {
      if (table.description) {
        lines.push(`-- ${table.description}`);
      }
      lines.push(this.generateCreateTableSQL(table));
      lines.push("");
    });

    return lines.join("\n");
  }
}

export async function generateSQL(
  schemaFile: string,
  outputFile: string
): Promise<void> {
  const schema = JSON.parse(fs.readFileSync(schemaFile, "utf-8")) as Schema;
  const generator = new SQLGenerator();
  const sql = generator.generateSchema(schema);

  fs.writeFileSync(outputFile, sql);
  console.log(`✓ SQL schema generated to ${outputFile}`);
}

// Main execution
async function main() {
  const schemaFile = path.join(process.cwd(), "generated/schema.json");
  const outputFile = path.join(process.cwd(), "generated/schema.sql");

  await generateSQL(schemaFile, outputFile);
}

main().catch(console.error);
