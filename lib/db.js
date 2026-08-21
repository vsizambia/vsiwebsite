import { Pool } from "pg";

const globalForDb = globalThis;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");

function normalizeDatabaseUrl(value) {
  try {
    const url = new URL(value);
    if (["prefer", "require", "verify-ca"].includes(url.searchParams.get("sslmode"))) url.searchParams.set("sslmode", "verify-full");
    return url.toString();
  } catch { return value; }
}

export const pool = globalForDb.__vsiVolunteerPool || new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
  ssl: { rejectUnauthorized: true }, max: 5, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000,
});
if (process.env.NODE_ENV !== "production") globalForDb.__vsiVolunteerPool = pool;

export async function ensureVolunteerTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS volunteer_applications (
      id BIGSERIAL PRIMARY KEY, full_name TEXT NOT NULL, age INTEGER, nationality TEXT, gender TEXT, faith TEXT, email TEXT NOT NULL, phone TEXT NOT NULL,
      province TEXT, district TEXT, constituency TEXT, ward TEXT, location TEXT, current_occupation TEXT, education TEXT,
      category TEXT NOT NULL, skills TEXT NOT NULL, availability TEXT NOT NULL, hours_per_week INTEGER,
      motivation TEXT NOT NULL, volunteering_elsewhere BOOLEAN NOT NULL DEFAULT FALSE, other_volunteering_details TEXT, past_volunteer_positions TEXT,
      reference_name TEXT, reference_organization TEXT, reference_phone TEXT, reference_email TEXT,
      criminal_conviction BOOLEAN NOT NULL DEFAULT FALSE, criminal_offence_details TEXT, disability BOOLEAN NOT NULL DEFAULT FALSE,
      disability_certificate TEXT, disability_certificate_name TEXT, profile_picture TEXT,
      emergency_name TEXT NOT NULL, emergency_phone TEXT NOT NULL, consent BOOLEAN NOT NULL DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','inactive')),
      rejection_reason TEXT, rejection_note TEXT, reviewed_at TIMESTAMPTZ,
      directorate TEXT, programme TEXT, project TEXT, activity TEXT, line_manager_name TEXT, line_manager_title TEXT, line_manager_phone TEXT, line_manager_email TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE volunteer_applications
    ADD COLUMN IF NOT EXISTS gender TEXT,
    ADD COLUMN IF NOT EXISTS faith TEXT,
    ADD COLUMN IF NOT EXISTS hours_per_week INTEGER,
    ADD COLUMN IF NOT EXISTS disability BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS disability_certificate TEXT,
    ADD COLUMN IF NOT EXISTS disability_certificate_name TEXT,
    ADD COLUMN IF NOT EXISTS nationality TEXT,
    ADD COLUMN IF NOT EXISTS province TEXT,
    ADD COLUMN IF NOT EXISTS district TEXT,
    ADD COLUMN IF NOT EXISTS constituency TEXT,
    ADD COLUMN IF NOT EXISTS ward TEXT,
    ADD COLUMN IF NOT EXISTS volunteering_elsewhere BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS other_volunteering_details TEXT,
    ADD COLUMN IF NOT EXISTS past_volunteer_positions TEXT,
    ADD COLUMN IF NOT EXISTS reference_name TEXT,
    ADD COLUMN IF NOT EXISTS reference_organization TEXT,
    ADD COLUMN IF NOT EXISTS reference_phone TEXT,
    ADD COLUMN IF NOT EXISTS reference_email TEXT,
    ADD COLUMN IF NOT EXISTS criminal_conviction BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS criminal_offence_details TEXT,
    ADD COLUMN IF NOT EXISTS profile_picture TEXT,
    ADD COLUMN IF NOT EXISTS directorate TEXT,
    ADD COLUMN IF NOT EXISTS programme TEXT,
    ADD COLUMN IF NOT EXISTS project TEXT,
    ADD COLUMN IF NOT EXISTS activity TEXT,
    ADD COLUMN IF NOT EXISTS line_manager_name TEXT,
    ADD COLUMN IF NOT EXISTS line_manager_title TEXT,
    ADD COLUMN IF NOT EXISTS line_manager_phone TEXT,
    ADD COLUMN IF NOT EXISTS line_manager_email TEXT
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS volunteer_activity_register (
      id BIGSERIAL PRIMARY KEY,
      volunteer_id BIGINT NOT NULL REFERENCES volunteer_applications(id) ON DELETE CASCADE,
      activity_date DATE NOT NULL,
      activity_name TEXT NOT NULL,
      project TEXT,
      location TEXT,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      hours NUMERIC(6,2) NOT NULL CHECK (hours >= 0 AND hours <= 24),
      description TEXT,
      supervisor_name TEXT,
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS volunteer_activity_register_volunteer_date_idx ON volunteer_activity_register(volunteer_id, activity_date)`);
}

export const VSI_RECOMMENDED_HOURS_PER_WEEK = 6;
