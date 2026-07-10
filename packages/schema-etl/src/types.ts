export interface Column {
  name: string;
  type: "uuid" | "string" | "integer" | "boolean" | "timestamp" | "text" | "json";
  nullable: boolean;
  unique?: boolean;
  primaryKey?: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
}

export interface Table {
  name: string;
  columns: Column[];
  description?: string;
}

export interface Schema {
  tables: Table[];
  version: string;
  generatedAt: string;
}

export interface DomainEntity {
  name: string;
  description?: string;
  fields: {
    [key: string]: {
      type: string;
      description?: string;
      nullable?: boolean;
      references?: string;
    };
  };
  section: string;
}
