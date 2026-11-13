import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { isAdminAuthenticated, validAdminPassword } from "../../../../lib/admin-auth";
import { getAdminTotpSecret, getAdminTotpUri, verifyTotp } from "../../../../lib/totp";
import { pool } from "../../../../lib/db";

const WINDOW_SECONDS = 10 * 60;
const MAX_ATTEMPTS = 5;

function requestIp(request) {
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
function hashIp(ip) {
  return crypto.createHash("sha256").update(`${process.env.ADMIN_SESSION_SECRET}:${ip}`).digest("hex");
}

export async function GET() {
  return NextResponse.json({ error: "Use the secure re-authentication flow to access authenticator setup." }, { status: 405 });
}

export async function POST(request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const ipHash = hashIp(requestIp(request));
    await pool.query("DELETE FROM admin_login_attempts WHERE created_at < NOW() - INTERVAL '1 hour'");
    const recent = await pool.query(
      "SELECT COUNT(*)::int AS count FROM admin_login_attempts WHERE ip_hash=$1 AND created_at >= NOW() - ($2 * INTERVAL '1 second')",
      [ipHash, WINDOW_SECONDS]
    );
    if (recent.rows[0].count >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many verification attempts. Please try again later." }, { status: 429 });
    }

    let body;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Please provide your password and current authenticator code." }, { status: 400 });
    }

    const passwordValid = validAdminPassword(body?.password);
    const code = typeof body?.code === "string" ? body.code.replace(/\s+/g, "") : "";
    const secret = getAdminTotpSecret();
    if (!passwordValid || !/^\d{6}$/.test(code) || !secret || !verifyTotp(secret, code)) {
      await pool.query("INSERT INTO admin_login_attempts (ip_hash) VALUES ($1)", [ipHash]);
      return NextResponse.json({ error: "Re-authentication failed. Check your password and current 6-digit authenticator code." }, { status: 401 });
    }

    await pool.query("DELETE FROM admin_login_attempts WHERE ip_hash=$1", [ipHash]);
    const uri = getAdminTotpUri();
    if (!uri) return NextResponse.json({ error: "Authenticator is not configured." }, { status: 503 });
    return NextResponse.json({ account: "VSI Admin", issuer: "VSI", secret, uri });
  } catch (error) {
    console.error("Admin authenticator re-authentication error:", error);
    return NextResponse.json({ error: "Unable to verify your identity right now." }, { status: 500 });
  }
}
