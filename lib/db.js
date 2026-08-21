import { Pool } from "pg";

const globalForDb = globalThis;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");

export const pool = globalForDb.__vsiVolunteerPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

if (process.env.NODE_ENV !== "production") globalForDb.__vsiVolunteerPool = pool;

export async function ensureVolunteerTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS volunteer_applications (
      id BIGSERIAL PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
      location TEXT NOT NULL, category TEXT NOT NULL, skills TEXT NOT NULL, availability TEXT NOT NULL,
      motivation TEXT NOT NULL, emergency_name TEXT NOT NULL, emergency_phone TEXT NOT NULL,
      consent BOOLEAN NOT NULL DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}
