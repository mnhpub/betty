import fs from "fs";
import path from "path";
import type { Schema, Table, Column } from "./types.js";

class TypeScriptGenerator {
  private generateTableType(table: Table): string {
    const lines: string[] = [];

    // PascalCase table name for type
    const typeName = this.toPascalCase(table.name);

    lines.push(`export interface ${typeName} {`);

    table.columns.forEach((col) => {
      const tsType = this.mapColumnType(col);
      const optional = col.nullable ? "?" : "";
      lines.push(`  ${col.name}${optional}: ${tsType};`);
    });

    lines.push("}");
    lines.push("");

    // Also create an Insert type (excluding auto-generated fields)
    const insertFields = table.columns.filter(
      (col) => !col.primaryKey || col.type === "string"
    );
    lines.push(`export interface ${typeName}Insert {`);
    insertFields.forEach((col) => {
      const tsType = this.mapColumnType(col);
      const optional = col.nullable ? "?" : "";
      lines.push(`  ${col.name}${optional}: ${tsType};`);
    });
    lines.push("}");
    lines.push("");

    return lines.join("\n");
  }

  private mapColumnType(column: Column): string {
    const typeMap: Record<string, string> = {
      uuid: "string",
      string: "string",
      integer: "number",
      boolean: "boolean",
      timestamp: "string | Date",
      text: "string",
      json: "Record<string, unknown>",
    };
    return typeMap[column.type] || "unknown";
  }

  private toPascalCase(str: string): string {
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  }

  generateTypes(schema: Schema): string {
    const lines: string[] = [];
    lines.push("// Generated types from lms-domain.md");
    lines.push(`// Generated at: ${schema.generatedAt}`);
    lines.push("// DO NOT EDIT MANUALLY");
    lines.push("");

    schema.tables.forEach((table) => {
      if (table.description) {
        lines.push(`/** ${table.description} */`);
      }
      lines.push(this.generateTableType(table));
    });

    return lines.join("\n");
  }
}

export async function generateTypes(
  schemaFile: string,
  outputFile: string
): Promise<void> {
  const schema = JSON.parse(fs.readFileSync(schemaFile, "utf-8")) as Schema;
  const generator = new TypeScriptGenerator();
  const types = generator.generateTypes(schema);

  fs.writeFileSync(outputFile, types);
  console.log(`✓ TypeScript types generated to ${outputFile}`);
}

// Main execution
async function main() {
  const schemaFile = path.join(process.cwd(), "generated/schema.json");
  const outputFile = path.join(process.cwd(), "generated/schema.d.ts");

  await generateTypes(schemaFile, outputFile);
}

main().catch(console.error);
