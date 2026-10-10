import crypto from "node:crypto";
import { cookies } from "next/headers";
import { pool } from "./db";

export const VOLUNTEER_PORTAL_COOKIE = "vsi_volunteer_session";
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

export function portalSecret() {
  const value = process.env.VOLUNTEER_PORTAL_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("Volunteer portal session secret is not configured.");
  return value;
}
export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
export function hmac(value) {
  return crypto.createHmac("sha256", portalSecret()).update(value).digest("hex");
}
export function safeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || !/^[a-f0-9]+$/i.test(a) || !/^[a-f0-9]+$/i.test(b) || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}
export function clientIp(request) {
  // Vercel sets x-real-ip; do not trust arbitrary forwarded lists.
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
export function identityDigest(volunteerId, email) {
  return hmac(`${String(volunteerId).trim().toUpperCase()}:${String(email).trim().toLowerCase()}`);
}
export function ipDigest(request) {
  return hmac(clientIp(request));
}
export function originAllowed(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    const requestUrl = new URL(request.url);
    return parsed.origin === requestUrl.origin;
  } catch { return false; }
}
export async function currentVolunteer() {
  const jar = await cookies();
  const token = jar.get(VOLUNTEER_PORTAL_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/i.test(token)) return null;
  const tokenHash = sha256(token);
  const result = await pool.query(
    `SELECT v.id, v.volunteer_id, v.full_name, v.email, v.status, v.created_at,
            v.directorate, v.programme, v.project, v.activity, v.category, v.skills,
            v.availability, v.hours_per_week, v.current_occupation, v.education,
            s.id AS session_id
       FROM volunteer_portal_sessions s
       JOIN volunteer_applications v ON v.id=s.volunteer_application_id
      WHERE s.token_hash=$1 AND s.expires_at>NOW() AND LOWER(v.status)='approved'
      LIMIT 1`,
    [tokenHash]
  );
  if (!result.rowCount) return null;
  await pool.query("UPDATE volunteer_portal_sessions SET last_seen_at=NOW() WHERE id=$1", [result.rows[0].session_id]).catch(()=>{});
  const {session_id, ...volunteer} = result.rows[0];
  return volunteer;
}
export function newSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}
export function sessionCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: Math.floor(SESSION_TTL_MS / 1000) };
}
export function sessionExpiry() {
  return new Date(Date.now() + SESSION_TTL_MS);
}
