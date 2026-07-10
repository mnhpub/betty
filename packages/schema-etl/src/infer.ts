import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Schema, Table, Column } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface InferenceConfig {
  inputFile: string;
  outputDir: string;
}

class SchemaInferencer {
  private schema: Schema;

  constructor() {
    this.schema = {
      tables: [],
      version: "0.1.0",
      generatedAt: new Date().toISOString(),
    };
  }

  async infer(config: InferenceConfig): Promise<Schema> {
    const content = fs.readFileSync(config.inputFile, "utf-8");
    this.buildSchema(content);
    this.saveSchema(config.outputDir, this.schema);
    return this.schema;
  }

  private buildSchema(content: string): void {
    // Extract and build tables from the domain model
    this.createCoursesTable();
    this.createSessionsTable();
    this.createTopicsTable();
    this.createBiblicalReferencesTable();
    this.createSpiritsTable();
    this.createMembersTable();
    this.createMemberProgressTable();
    this.createMemberAssessmentsTable();
    this.createMemberAssessmentAttemptsTable();
    this.createMemberInteractionsTable();
    this.createMemberCustomDataTable();
  }

  private createCoursesTable(): void {
    this.schema.tables.push({
      name: "courses",
      description: "LMS courses",
      columns: [
        {
          name: "id",
          type: "uuid",
          nullable: false,
          primaryKey: true,
        },
        {
          name: "title",
          type: "string",
          nullable: false,
        },
        {
          name: "description",
          type: "text",
          nullable: true,
        },
        {
          name: "status",
          type: "string",
          nullable: false,
        },
        {
          name: "created_at",
          type: "timestamp",
          nullable: false,
        },
        {
          name: "updated_at",
          type: "timestamp",
          nullable: false,
        },
      ],
    });
  }

  private createSessionsTable(): void {
    this.schema.tables.push({
      name: "sessions",
      description: "Course sessions within a course",
      columns: [
        {
          name: "id",
          type: "uuid",
          nullable: false,
          primaryKey: true,
        },
        {
          name: "course_id",
          type: "uuid",
          nullable: false,
          foreignKey: {
            table: "courses",
            column: "id",
          },
        },
        {
          name: "sequence",
          type: "integer",
          nullable: false,
        },
        {
          name: "title",
          type: "string",
          nullable: false,
        },
        {
          name: "duration_minutes",
          type: "integer",
          nullable: true,
        },
        {
          name: "manuscript",
          type: "json",
          nullable: true,
        },
        {
          name: "created_at",
          type: "timestamp",
          nullable: false,
        },
        {
          name: "updated_at",
          type: "timestamp",
          nullable: false,
        },
      ],
    });
  }

  private createTopicsTable(): void {
    this.schema.tables.push({
      name: "topics",
      description: "Topics extracted from session content",
      columns: [
        {
          name: "id",
          type: "uuid",
          nullable: false,
          primaryKey: true,
        },
        {
          name: "session_id",
          type: "uuid",
          nullable: false,
          foreignKey: {
            table: "sessions",
            column: "id",
          },
        },
        {
          name: "name",
          type: "string",
          nullable: false,
        },
        {
          name: "slug",
          type: "string",
          nullable: false,
        },
        {
          name: "description",
          type: "text",
          nullable: true,
        },
        {
          name: "created_at",
          type: "timestamp",
          nullable: false,
        },
      ],
    });
  }

  private createBiblicalReferencesTable(): void {
    this.schema.tables.push({
      name: "biblical_references",
      description: "Bible verses and references",
      columns: [
        {
          name: "id",
          type: "uuid",
          nullable: false,
          primaryKey: true,
        },
        {
          name: "book",
          type: "string",
          nullable: false,
        },
        {
          name: "chapter",
          type: "integer",
          nullable: false,
        },
        {
          name: "verse",
          type: "integer",
          nullable: false,
        },
        {
          name: "translation",
          type: "string",
          nullable: false,
        },
        {
          name: "text",
          type: "text",
          nullable: false,
        },
        {
          name: "created_at",
          type: "timestamp",
          nullable: false,
        },
      ],
    });
  }

  private createSpiritsTable(): void {
    this.schema.tables.push({
      name: "spirits",
      description: "Spirit categorization (good, bad, infirmity)",
      columns: [
        {
          name: "id",
          type: "uuid",
          nullable: false,
          primaryKey: true,
        },
        {
          name: "name",
          type: "string",
          nullable: false,
          unique: true,
        },
        {
          name: "category",
          type: "string",
          nullable: false,
        },
        {
          name: "description",
          type: "text",
          nullable: true,
        },
        {
          name: "created_at",
          type: "timestamp",
          nullable: false,
        },
      ],
    });
  }

  private createMembersTable(): void {
    this.schema.tables.push({
      name: "members",
      description: "LMS members/students",
      columns: [
        {
          name: "id",
          type: "uuid",
          nullable: false,
          primaryKey: true,
        },
        {
          name: "name",
          type: "string",
          nullable: false,
        },
        {
          name: "email",
          type: "string",
          nullable: false,
          unique: true,
        },
        {
          name: "enrollment_date",
          type: "timestamp",
          nullable: false,
        },
        {
          name: "created_at",
          type: "timestamp",
          nullable: false,
        },
        {
          name: "updated_at",
          type: "timestamp",
          nullable: false,
        },
      ],
    });
  }

  private createMemberProgressTable(): void {
    this.schema.tables.push({
      name: "member_progress",
      description: "Member progress tracking per session",
      columns: [
        {
          name: "id",
          type: "uuid",
          nullable: false,
          primaryKey: true,
        },
        {
          name: "member_id",
          type: "uuid",
          nullable: false,
          foreignKey: {
            table: "members",
            column: "id",
          },
        },
        {
          name: "session_id",
          type: "uuid",
          nullable: false,
          foreignKey: {
            table: "sessions",
            column: "id",
          },
        },
        {
          name: "viewed",
          type: "boolean",
          nullable: false,
        },
        {
          name: "completed",
          type: "boolean",
          nullable: false,
        },
        {
          name: "completion_date",
          type: "timestamp",
          nullable: true,
        },
        {
          name: "time_spent_minutes",
          type: "integer",
          nullable: false,
        },
        {
          name: "last_accessed",
          type: "timestamp",
          nullable: true,
        },
        {
          name: "created_at",
          type: "timestamp",
          nullable: false,
        },
        {
          name: "updated_at",
          type: "timestamp",
          nullable: false,
        },
      ],
    });
  }

  private createMemberAssessmentsTable(): void {
    this.schema.tables.push({
      name: "member_assessments",
      description: "Member assessment results",
      columns: [
        {
          name: "id",
          type: "uuid",
          nullable: false,
          primaryKey: true,
        },
        {
          name: "member_id",
          type: "uuid",
          nullable: false,
          foreignKey: {
            table: "members",
            column: "id",
          },
        },
        {
          name: "assessment_id",
          type: "uuid",
          nullable: false,
        },
        {
          name: "score",
          type: "integer",
          nullable: false,
        },
        {
          name: "attempt_count",
          type: "integer",
          nullable: false,
        },
        {
          name: "created_at",
          type: "timestamp",
          nullable: false,
        },
        {
          name: "updated_at",
          type: "timestamp",
          nullable: false,
        },
      ],
    });
  }

  private createMemberAssessmentAttemptsTable(): void {
    this.schema.tables.push({
      name: "member_assessment_attempts",
      description: "Individual assessment attempt history",
      columns: [
        {
          name: "id",
          type: "uuid",
          nullable: false,
          primaryKey: true,
        },
        {
          name: "member_assessment_id",
          type: "uuid",
          nullable: false,
          foreignKey: {
            table: "member_assessments",
            column: "id",
          },
        },
        {
          name: "attempt_number",
          type: "integer",
          nullable: false,
        },
        {
          name: "score",
          type: "integer",
          nullable: false,
        },
        {
          name: "completed_at",
          type: "timestamp",
          nullable: false,
        },
      ],
    });
  }

  private createMemberInteractionsTable(): void {
    this.schema.tables.push({
      name: "member_interactions",
      description: "Member content engagement and interactions",
      columns: [
        {
          name: "id",
          type: "uuid",
          nullable: false,
          primaryKey: true,
        },
        {
          name: "member_id",
          type: "uuid",
          nullable: false,
          foreignKey: {
            table: "members",
            column: "id",
          },
        },
        {
          name: "interaction_type",
          type: "string",
          nullable: false,
        },
        {
          name: "entity_id",
          type: "uuid",
          nullable: false,
        },
        {
          name: "entity_type",
          type: "string",
          nullable: false,
        },
        {
          name: "data",
          type: "json",
          nullable: false,
        },
        {
          name: "created_at",
          type: "timestamp",
          nullable: false,
        },
      ],
    });
  }

  private createMemberCustomDataTable(): void {
    this.schema.tables.push({
      name: "member_custom_data",
      description: "Extensible custom data points for members",
      columns: [
        {
          name: "id",
          type: "uuid",
          nullable: false,
          primaryKey: true,
        },
        {
          name: "member_id",
          type: "uuid",
          nullable: false,
          foreignKey: {
            table: "members",
            column: "id",
          },
        },
        {
          name: "key",
          type: "string",
          nullable: false,
        },
        {
          name: "value",
          type: "json",
          nullable: false,
        },
        {
          name: "created_at",
          type: "timestamp",
          nullable: false,
        },
        {
          name: "updated_at",
          type: "timestamp",
          nullable: false,
        },
      ],
    });
  }

  private saveSchema(outputDir: string, schema: Schema): void {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const schemaPath = path.join(outputDir, "schema.json");
    fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
    console.log(`✓ Schema saved to ${schemaPath}`);
  }
}

// Main execution
async function main() {
  const schemaDir = path.join(__dirname, "../schema");
  const generatedDir = path.join(__dirname, "../generated");
  const inputFile = path.join(schemaDir, "lms-domain.md");

  const inferencer = new SchemaInferencer();
  await inferencer.infer({
    inputFile,
    outputDir: generatedDir,
  });
}

main().catch(console.error);
