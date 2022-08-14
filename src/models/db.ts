import pgPromise, { QueryFile } from "pg-promise";
import { join as joinPath } from "path";
import { config } from "dotenv";

config();
const databaseUrl = new Map();
databaseUrl.set("development", process.env.DEV_DATABASE_URL ?? "");
databaseUrl.set("staging", process.env.STAGING_DATABASE_URL ?? "");
databaseUrl.set("testing", process.env.TESTING_DATABASE_URL ?? "");
const client = pgPromise()({
  ssl: { rejectUnauthorized: false },
  connectionString: databaseUrl.get(process.env.NODE_ENV),
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

if (process.env.NODE_ENV === "development") {
  const tables = sql("table");
  client.query(tables).catch(console.error);
}

if (process.env.NODE_ENV === "staging") {
  const migrationQuery = sql("migration");
  client.query(migrationQuery).catch(console.error);
}

export interface BaseType {
  readonly id?: string;
  readonly createdAt?: string | Date;
  readonly updatedAt?: string | Date;
}
