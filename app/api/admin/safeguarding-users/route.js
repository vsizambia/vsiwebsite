import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { pool } from "../../../../lib/db";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";
import {
  encryptSafeguardingTotp, generateSafeguardingTotpSecret,
  generateTemporaryPassword, hashSafeguardingPassword, safeguardingRoleLabels
} from "../../../../lib/safeguarding-auth";

const roles = new Set(["safeguarding_lead", "case_officer", "read_only"]);
const denied = () => NextResponse.json({ error: "Existing VSI Admin authentication is required to manage safeguarding accounts." }, { status: 401 });
export async function GET(request) {
  if (!isAdminAuthenticated(request)) return denied();
  try {
    const result = await pool.query("SELECT id,username,display_name,role,active,created_at,updated_at,last_login_at FROM safeguarding_users ORDER BY display_name,username");
    return NextResponse.json({ users: result.rows.map(user => ({ ...user, roleLabel: safeguardingRoleLabels(user.role) })) });
  } catch (error) {
    console.error("Safeguarding account list failed:", error?.message || "unknown error");
    return NextResponse.json({ error: "Unable to load safeguarding accounts." }, { status: 500 });
  }
}
export async function POST(request) {
  if (!isAdminAuthenticated(request)) return denied();
  try {
    const body = await request.json();
    const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
    const displayName = typeof body?.displayName === "string" ? body.displayName.trim().slice(0, 120) : "";
    const role = typeof body?.role === "string" ? body.role : "";
    if (!/^[a-z0-9][a-z0-9._-]{2,79}$/.test(username) || displayName.length < 2 || !roles.has(role)) {
      return NextResponse.json({ error: "Provide a username (3–80 letters/numbers or . _ -), display name and valid role." }, { status: 400 });
    }
    const password = generateTemporaryPassword();
    const secret = generateSafeguardingTotpSecret();
    const result = await pool.query(
      "INSERT INTO safeguarding_users(username,display_name,password_hash,role,active,totp_secret_encrypted) VALUES($1,$2,$3,$4,TRUE,$5) RETURNING id,username,display_name,role,active,created_at",
      [username, displayName, hashSafeguardingPassword(password), role, encryptSafeguardingTotp(secret)]
    );
    await pool.query("INSERT INTO safeguarding_audit_log(report_id,action,actor,details) VALUES(NULL,'user_created','Authenticated VSI Admin',$1::jsonb)", [JSON.stringify({ username, role })]);
    const user = result.rows[0];
    return NextResponse.json({
      ok: true,
      user: { ...user, roleLabel: safeguardingRoleLabels(user.role) },
      credentials: { initialPassword: password, authenticatorSecret: secret, authenticatorUri: "otpauth://totp/" + encodeURIComponent("VSI Safeguarding:" + username) + "?secret=" + secret + "&issuer=VSI%20Safeguarding&algorithm=SHA1&digits=6&period=30" },
      warning: "Save these setup details securely and share them with the named staff member through a trusted channel. They are returned only when this account is created; save them securely."
    }, { status: 201 });
  } catch (error) {
    if (error?.code === "23505") return NextResponse.json({ error: "That username already exists." }, { status: 409 });
    console.error("Safeguarding account creation failed:", error?.message || "unknown error");
    return NextResponse.json({ error: "Unable to create the safeguarding account." }, { status: 500 });
  }
}
export async function PATCH(request) {
  if (!isAdminAuthenticated(request)) return denied();
  try {
    const body = await request.json();
    const id = Number(body?.id);
    const active = body?.active;
    if (!Number.isInteger(id) || id < 1 || typeof active !== "boolean") return NextResponse.json({ error: "Provide an account ID and active true/false." }, { status: 400 });
    const result = await pool.query("UPDATE safeguarding_users SET active=$1,updated_at=NOW() WHERE id=$2 RETURNING id,username,display_name,role,active", [active, id]);
    if (!result.rows[0]) return NextResponse.json({ error: "Account not found." }, { status: 404 });
    await pool.query("INSERT INTO safeguarding_audit_log(report_id,action,actor,details) VALUES(NULL,'user_status_changed','Authenticated VSI Admin',$1::jsonb)", [JSON.stringify({ username: result.rows[0].username, active })]);
    return NextResponse.json({ ok: true, user: result.rows[0] });
  } catch (error) {
    console.error("Safeguarding account update failed:", error?.message || "unknown error");
    return NextResponse.json({ error: "Unable to update the safeguarding account." }, { status: 500 });
  }
}
