import pgPromise, { QueryFile } from "pg-promise";
import { join as joinPath } from "path";
import { config } from "dotenv";

config();
const client = pgPromise()({
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  connectionString: process.env.DATABASE_URL,
});

export class Database {
  readonly client = client;

  validationErrHandler(errors: Error[]) {
    throw { name: "ValidationError", messages: errors };
  }

  queryErrHandler(
    err: Error & {
      detail: string;
      table: string;
      constraint: string;
      routine: string;
    }
  ) {
    const { name, message, detail, table, constraint, routine } = err;
    throw {
      name: "Query",
      alias: name,
      message,
      detail,
      table,
      constraint,
      routine,
    };
  }
}

export function sql(file: string) {
  const fullPath = joinPath(__dirname, `../../sql/${file}.sql`); // generating full path;
  return new QueryFile(fullPath, { minify: true });
}

const tables = sql("tables");
client.query(tables).catch(console.error);

export interface BaseType {
  readonly id?: string;
  readonly createdAt?: string | Date;
  readonly updatedAt?: string | Date;
}

export interface UserScope {
  from?: string;
  to?: string;
}

export interface QueryByUser {
  email?: string;
  page?: number;
  size?: number;
}
