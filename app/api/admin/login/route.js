import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_PENDING_COOKIE, isAdminTwoFactorPending, makeSignedToken, validAdminPassword } from "../../../../lib/admin-auth";
import { getAdminTotpSecret, verifyTotp } from "../../../../lib/totp";
import { pool } from "../../../../lib/db";
import crypto from "node:crypto";

const MAX_AGE = 60 * 60 * 8;
const PENDING_AGE = 5 * 60;
const LOGIN_WINDOW_SECONDS = 10 * 60;
const MAX_FAILED_ATTEMPTS = 5;

function requestIp(request) {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  return (forwarded.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim();
}
function hashIp(ip) { return crypto.createHash("sha256").update(`${process.env.ADMIN_SESSION_SECRET}:${ip}`).digest("hex"); }
async function ensureLoginAttemptTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_login_attempts (id BIGSERIAL PRIMARY KEY,ip_hash TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  await pool.query(`CREATE INDEX IF NOT EXISTS admin_login_attempts_ip_created_idx ON admin_login_attempts(ip_hash,created_at DESC)`);
}
function clearCookie(response, name) { response.cookies.set(name, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 }); }

export async function POST(request) {
  try {
    const totpSecret = getAdminTotpSecret();
    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET || !totpSecret) return NextResponse.json({ error: "Admin authenticator is not configured yet." }, { status: 503 });
    const ipHash = hashIp(requestIp(request));
    await ensureLoginAttemptTable();
    await pool.query("DELETE FROM admin_login_attempts WHERE created_at < NOW() - INTERVAL '1 hour'");
    const recent = await pool.query("SELECT COUNT(*)::int AS count FROM admin_login_attempts WHERE ip_hash=$1 AND created_at >= NOW() - ($2 * INTERVAL '1 second')", [ipHash, LOGIN_WINDOW_SECONDS]);
    if (recent.rows[0].count >= MAX_FAILED_ATTEMPTS) return NextResponse.json({ error: "Too many unsuccessful sign-in attempts. Please try again later." }, { status: 429 });
    const body = await request.json();
    const password = body?.password;
    const code = String(body?.code || "").replace(/\s+/g, "");
    if (!code) {
      if (!validAdminPassword(password)) {
        await pool.query("INSERT INTO admin_login_attempts (ip_hash) VALUES ($1)", [ipHash]);
        return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
      }
      await pool.query("DELETE FROM admin_login_attempts WHERE ip_hash=$1", [ipHash]);
      const response = NextResponse.json({ ok: true, requiresAuthenticator: true });
      response.cookies.set(ADMIN_PENDING_COOKIE, makeSignedToken(PENDING_AGE), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: PENDING_AGE });
      return response;
    }
    if (!isAdminTwoFactorPending(request) || !verifyTotp(totpSecret, code)) {
      await pool.query("INSERT INTO admin_login_attempts (ip_hash) VALUES ($1)", [ipHash]);
      return NextResponse.json({ error: "Invalid authenticator code." }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true, authenticated: true });
    response.cookies.set(ADMIN_COOKIE, makeSignedToken(MAX_AGE), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: MAX_AGE });
    clearCookie(response, ADMIN_PENDING_COOKIE);
    await pool.query("DELETE FROM admin_login_attempts WHERE ip_hash=$1", [ipHash]);
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Unable to sign in." }, { status: 500 });
  }
}
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearCookie(response, ADMIN_COOKIE); clearCookie(response, ADMIN_PENDING_COOKIE); return response;
}
