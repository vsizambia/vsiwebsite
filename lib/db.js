import { Pool } from "pg";

const globalForDb = globalThis;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");

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

export const pool = globalForDb.__vsiVolunteerPool || new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
  ssl: { rejectUnauthorized: true },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

if (process.env.NODE_ENV !== "production") globalForDb.__vsiVolunteerPool = pool;

export async function ensureVolunteerTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS volunteer_applications (
      id BIGSERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      age INTEGER,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      location TEXT NOT NULL,
      current_occupation TEXT,
      education TEXT,
      category TEXT NOT NULL,
      skills TEXT NOT NULL,
      availability TEXT NOT NULL,
      motivation TEXT NOT NULL,
      emergency_name TEXT NOT NULL,
      emergency_phone TEXT NOT NULL,
      consent BOOLEAN NOT NULL DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
      rejection_reason TEXT,
      rejection_note TEXT,
      reviewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE volunteer_applications
      ADD COLUMN IF NOT EXISTS age INTEGER,
      ADD COLUMN IF NOT EXISTS current_occupation TEXT,
      ADD COLUMN IF NOT EXISTS education TEXT,
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
      ADD COLUMN IF NOT EXISTS rejection_note TEXT,
      ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ
  `);
}
