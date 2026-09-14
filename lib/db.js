import { Pool } from "pg";

const globalForDb = globalThis;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

function normalizeDatabaseUrl(value) {
  try {
    const url = new URL(value);
    if (["prefer", "require", "verify-ca"].includes(url.searchParams.get("sslmode"))) {
      url.searchParams.set("sslmode", "verify-full");
    }
    return url.toString();
  } catch {
    return value;
  }
}

export const pool =
  globalForDb.__vsiVolunteerPool ||
  new Pool({
    connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
    ssl: { rejectUnauthorized: true },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__vsiVolunteerPool = pool;
}

// Database schema changes are intentionally not performed from request handlers.
// Tables, columns, indexes, constraints and roles must be managed by controlled
// migrations using a separate owner/migrator connection. These compatibility
// functions remain exported because existing routes call them before queries.
export async function ensureVolunteerTable() {}
export async function ensureVolunteerFinanceTables() {}
export async function ensureDataProtectionTables() {}
export async function ensureNewsTable() {}
export async function ensureEventsTable() {}

export const VSI_RECOMMENDED_HOURS_PER_WEEK = 6;
