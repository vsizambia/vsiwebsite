import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { pool } from "../../../../lib/db";
import { hmac, identityDigest, ipDigest, originAllowed, portalSecret } from "../../../../lib/volunteer-portal-auth";

export const runtime = "nodejs";
const genericMessage = "If the details match an approved VSI volunteer record, a verification code will be sent to the registered email address.";
const json = (body, status=200) => NextResponse.json(body, {status, headers:{"Cache-Control":"no-store"}});
export async function POST(request) {
  if (!originAllowed(request)) return json({error:"Request could not be verified."}, 403);
  try {
    portalSecret();
    const body = await request.json();
    const volunteerId = typeof body.volunteerId === "string" ? body.volunteerId.trim().toUpperCase() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^[A-Z0-9-]{3,32}$/.test(volunteerId) || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({message:genericMessage});
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.VOLUNTEER_PORTAL_FROM_EMAIL;
    if (!apiKey || !from) {
      console.error("Volunteer portal email delivery is not configured.");
      return json({error:"Email verification is temporarily unavailable. Please contact VSI administration."},503);
    }
    const identityHash = identityDigest(volunteerId, email);
    const clientIpHash = ipDigest(request);
    const client = await pool.connect();
    let volunteer = null;
    const challengeId = crypto.randomUUID();
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [clientIpHash]);
      const counts = await client.query(
        `SELECT COUNT(*) FILTER (WHERE client_ip_hash=$1)::int AS ip_count,
                COUNT(*) FILTER (WHERE identity_hash=$2)::int AS identity_count
           FROM volunteer_portal_challenges WHERE created_at > NOW() - INTERVAL '1 hour'`,
        [clientIpHash, identityHash]
      );
      if (counts.rows[0].ip_count >= 10 || counts.rows[0].identity_count >= 5) {
        await client.query("ROLLBACK");
        return json({message:genericMessage});
      }
      const found = await client.query(
        `SELECT id, email FROM volunteer_applications
          WHERE UPPER(TRIM(volunteer_id))=$1 AND LOWER(TRIM(email))=$2
            AND LOWER(status)='approved' AND volunteer_id IS NOT NULL LIMIT 1`,
        [volunteerId, email]
      );
      if (found.rowCount) volunteer = found.rows[0];
      const codeHash = hmac(`otp:${challengeId}:${code}`);
      await client.query(
        `INSERT INTO volunteer_portal_challenges
          (id,volunteer_application_id,code_hash,identity_hash,client_ip_hash,expires_at)
         VALUES ($1,$2,$3,$4,$5,NOW()+INTERVAL '10 minutes')`,
        [challengeId, volunteer?.id ?? null, codeHash, identityHash, clientIpHash]
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(()=>{});
      throw error;
    } finally { client.release(); }

    if (volunteer) {
      const mail = await fetch("https://api.resend.com/emails", {
        method:"POST",
        headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},
        body:JSON.stringify({
          from, to:[volunteer.email], subject:"Your VSI Volunteer Portal verification code",
          text:`Your VSI Volunteer Portal verification code is ${code}. It expires in 10 minutes. Do not share this code with anyone. If you did not request it, you can ignore this email.`,
          html:`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0b2942"><h2>VSI Volunteer Portal</h2><p>Use this one-time verification code to sign in:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. Do not share it with anyone.</p><p>If you did not request this code, you can ignore this email.</p></div>`
        })
      });
      if (!mail.ok) {
        await pool.query("DELETE FROM volunteer_portal_challenges WHERE id=$1", [challengeId]).catch(()=>{});
        console.error("Volunteer portal email provider rejected a verification email.", {status:mail.status});
        return json({error:"Email verification is temporarily unavailable. Please try again later."},503);
      }
    }
    return json({message:genericMessage, challengeId});
  } catch (error) {
    console.error("Volunteer portal code request failed.", error?.message || "unknown error");
    return json({error:"Unable to start email verification right now."},500);
  }
}
