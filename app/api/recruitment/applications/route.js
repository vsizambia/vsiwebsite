import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { publicPool } from "../../../../lib/db";

export const dynamic = "force-dynamic";
const clean = value => typeof value === "string" ? value.trim() : "";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const policyVersion = "2026-11";

function requestKey(request) {
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  return crypto.createHash("sha256").update(ip.trim()).digest("hex");
}

export async function POST(request) {
  let client;
  try {
    const body = await request.json();
    const opportunityId = Number(body.opportunityId);
    const fullName = clean(body.fullName);
    const email = clean(body.email).toLowerCase();
    const phone = clean(body.phone);
    const motivation = clean(body.motivation);
    if (!Number.isSafeInteger(opportunityId) || opportunityId < 1 || !fullName || fullName.length > 160 ||
        !emailPattern.test(email) || email.length > 254 || !phone || phone.length > 40 ||
        !motivation || motivation.length > 5000 || body.consent !== true) {
      return NextResponse.json({ error: "Complete the required fields and accept the privacy notice." }, { status: 400 });
    }
    for (const field of ["location","education","currentOccupation","experience","portfolioUrl"]) {
      if (typeof body[field] === "string" && body[field].length > 5000) {
        return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 });
      }
    }
    if (!publicPool) return NextResponse.json({ error: "Public recruitment submission is not configured." }, { status: 503 });
    client = await publicPool.connect();
    await client.query("BEGIN");
    const key = requestKey(request);
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [key]);
    const emailHash = crypto.createHash("sha256").update(email).digest("hex");
    const recent = await client.query(
      "SELECT COUNT(*)::int AS count FROM vsi_recruitment_submission_limits WHERE email_hash=$1 AND created_at > NOW() - INTERVAL '1 hour'",
      [emailHash]
    );
    if (recent.rows[0].count >= 5) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Too many applications from this email address. Please try again later." }, { status: 429 });
    }
    const opportunity = await client.query(
      "SELECT id FROM vsi_recruitment_opportunities WHERE id=$1 AND status='published' AND (closing_date IS NULL OR closing_date >= CURRENT_DATE)",
      [opportunityId]
    );
    if (!opportunity.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "This opportunity is no longer accepting applications." }, { status: 404 });
    }
    const reference = `VSI-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    await client.query(
      "INSERT INTO vsi_recruitment_submission_limits (email_hash) VALUES ($1)", [emailHash]
    );
    await client.query(
      `INSERT INTO vsi_recruitment_applications
       (opportunity_id,reference_number,full_name,email,phone,location,education,current_occupation,experience,motivation,portfolio_url,consent_policy_version)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [opportunityId,reference,fullName,email,phone,clean(body.location),clean(body.education),clean(body.currentOccupation),clean(body.experience),motivation,clean(body.portfolioUrl),policyVersion]
    );
    await client.query("COMMIT");
    return NextResponse.json({ ok: true, referenceNumber: reference }, { status: 201 });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    console.error("Recruitment application:", error);
    return NextResponse.json({ error: "We could not submit your application. Please try again." }, { status: 500 });
  } finally {
    client?.release();
  }
}
