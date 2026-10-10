import { NextResponse } from "next/server";
import { pool } from "../../../../../lib/db";
import { VOLUNTEER_PORTAL_COOKIE, hmac, originAllowed, portalSecret, safeEqualHex, sha256, newSessionToken, sessionCookieOptions, sessionExpiry } from "../../../../../lib/volunteer-portal-auth";

export const runtime = "nodejs";
const json = (body,status=200) => NextResponse.json(body,{status,headers:{"Cache-Control":"no-store"}});
export async function POST(request) {
  if (!originAllowed(request)) return json({error:"Request could not be verified."},403);
  try {
    portalSecret();
    const body = await request.json();
    const challengeId = typeof body.challengeId === "string" ? body.challengeId : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!/^[0-9a-f-]{36}$/i.test(challengeId) || !/^\d{6}$/.test(code)) return json({error:"The code is invalid or expired."},400);
    const client = await pool.connect();
    let volunteerId = null;
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `SELECT id,volunteer_application_id,code_hash,attempts,expires_at,consumed_at
           FROM volunteer_portal_challenges WHERE id=$1 FOR UPDATE`,
        [challengeId]
      );
      if (!result.rowCount) { await client.query("ROLLBACK"); return json({error:"The code is invalid or expired."},400); }
      const row = result.rows[0];
      if (row.consumed_at || new Date(row.expires_at).getTime() <= Date.now() || row.attempts >= 5 || !row.volunteer_application_id) {
        await client.query("ROLLBACK");
        return json({error:"The code is invalid or expired."},400);
      }
      const valid = safeEqualHex(row.code_hash, hmac(`otp:${challengeId}:${code}`));
      if (!valid) {
        await client.query("UPDATE volunteer_portal_challenges SET attempts=attempts+1 WHERE id=$1",[challengeId]);
        await client.query("COMMIT");
        return json({error:"The code is invalid or expired."},400);
      }
      await client.query("UPDATE volunteer_portal_challenges SET consumed_at=NOW() WHERE id=$1",[challengeId]);
      volunteerId = row.volunteer_application_id;
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(()=>{});
      throw error;
    } finally { client.release(); }

    const token = newSessionToken();
    const expiresAt = sessionExpiry();
    await pool.query("INSERT INTO volunteer_portal_sessions(volunteer_application_id,token_hash,expires_at) VALUES($1,$2,$3)",[volunteerId,sha256(token),expiresAt]);
    const response = json({ok:true});
    response.cookies.set(VOLUNTEER_PORTAL_COOKIE,token,{...sessionCookieOptions(),expires:expiresAt});
    return response;
  } catch (error) {
    console.error("Volunteer portal code verification failed.",error?.message||"unknown error");
    return json({error:"Unable to verify the code right now."},500);
  }
}
