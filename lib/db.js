import { Pool } from "pg";

const globalForDb = globalThis;

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

function createLazyPool({ envKey, cacheKey }) {
  let instance = globalForDb[cacheKey] || null;

  function getPool() {
    const connectionString = process.env[envKey];
    if (!connectionString) {
      throw new Error(`${envKey} is not configured`);
    }

    if (!instance) {
      instance = new Pool({
        connectionString: normalizeDatabaseUrl(connectionString),
        ssl: { rejectUnauthorized: true },
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
      if (process.env.NODE_ENV !== "production") {
        globalForDb[cacheKey] = instance;
      }
    }

    return instance;
  }

  // Delay requiring a configured database until a request actually uses it.
  // This lets Next.js compile and collect route data in Preview environments
  // without database credentials, while database-backed requests still fail
  // clearly if their environment is not configured.
  return new Proxy({}, {
    get(_target, property) {
      const pool = getPool();
      const value = pool[property];
      return typeof value === "function" ? value.bind(pool) : value;
    },
  });
}

export const pool = createLazyPool({
  envKey: "DATABASE_URL",
  cacheKey: "__vsiVolunteerPool",
});

// Anonymous/public submission routes use a separate restricted database role.
// This must be provisioned as PUBLIC_DATABASE_URL in the runtime environment.
export const publicPool = process.env.PUBLIC_DATABASE_URL
  ? (globalForDb.__vsiPublicPool || new Pool({
      connectionString: normalizeDatabaseUrl(process.env.PUBLIC_DATABASE_URL),
      ssl: { rejectUnauthorized: true },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }))
  : null;

if (process.env.NODE_ENV !== "production" && publicPool) {
  globalForDb.__vsiPublicPool = publicPool;
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
