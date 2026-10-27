import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { pool } from "../../../../lib/db";
import {
  SAFEGUARDING_COOKIE, createSafeguardingSession, decryptSafeguardingTotp,
  verifySafeguardingPassword, verifySafeguardingTotp
} from "../../../../lib/safeguarding-auth";

function ipHash(request) {
  const ip = (request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
  return crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "missing").update(ip).digest("hex");
}
export async function POST(request) {
  if (!process.env.ADMIN_SESSION_SECRET) return NextResponse.json({ error: "Safeguarding sign-in is not configured." }, { status: 503 });
  try {
    const body = await request.json();
    const username = typeof body?.username === "string" ? body.username.trim().toLowerCase().slice(0, 80) : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const code = typeof body?.code === "string" ? body.code.replace(/\s+/g, "") : "";
    if (!username || !password || !/^\d{6}$/.test(code)) return NextResponse.json({ error: "Enter your username, password and current 6-digit authenticator code." }, { status: 400 });
    const key = ipHash(request);
    await pool.query("DELETE FROM admin_login_attempts WHERE created_at < NOW() - INTERVAL '1 hour'");
    const recent = await pool.query("SELECT COUNT(*)::int AS count FROM admin_login_attempts WHERE ip_hash=$1 AND created_at >= NOW() - INTERVAL '10 minutes'", [key]);
    if (recent.rows[0].count >= 5) return NextResponse.json({ error: "Too many unsuccessful sign-in attempts. Please try again later." }, { status: 429 });
    const result = await pool.query("SELECT id,username,display_name,password_hash,role,active,totp_secret_encrypted FROM safeguarding_users WHERE username=$1 LIMIT 1", [username]);
    const user = result.rows[0];
    let valid = false;
    if (user?.active && verifySafeguardingPassword(password, user.password_hash)) {
      try { valid = verifySafeguardingTotp(decryptSafeguardingTotp(user.totp_secret_encrypted), code); } catch { valid = false; }
    }
    if (!valid) {
      await pool.query("INSERT INTO admin_login_attempts (ip_hash) VALUES ($1)", [key]);
      return NextResponse.json({ error: "Sign-in details could not be verified. Check your details and try again." }, { status: 401 });
    }
    await pool.query("DELETE FROM admin_login_attempts WHERE ip_hash=$1", [key]);
    await pool.query("UPDATE safeguarding_users SET last_login_at=NOW() WHERE id=$1", [user.id]);
    await pool.query("INSERT INTO safeguarding_audit_log(report_id,action,actor,details) VALUES(NULL,'user_login',$1,$2::jsonb)", [user.username, JSON.stringify({ role: user.role })]);
    const response = NextResponse.json({ ok: true, user: { username: user.username, displayName: user.display_name, role: user.role } });
    response.cookies.set(SAFEGUARDING_COOKIE, createSafeguardingSession(user), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
    return response;
  } catch (error) {
    console.error("Safeguarding sign-in failed:", error?.message || "unknown error");
    return NextResponse.json({ error: "Unable to sign in to safeguarding records." }, { status: 500 });
  }
}
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SAFEGUARDING_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
