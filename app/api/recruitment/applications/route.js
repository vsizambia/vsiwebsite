import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { publicPool } from "../../../../lib/db";
export const dynamic = "force-dynamic";
const clean = value => typeof value === "string" ? value.trim() : "";
const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
const policyVersion = "2026-11";
const limits = { location:200, education:500, currentOccupation:200, experience:5000, portfolioUrl:2048 };
export async function POST(request) {
  let client;
  try {
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 20000) return NextResponse.json({ error: "Application is too large." }, { status: 413 });
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid application details." }, { status: 400 });
    const opportunityId = Number(body.opportunityId);
    const fullName = clean(body.fullName), email = clean(body.email).toLowerCase();
    const phone = clean(body.phone), motivation = clean(body.motivation);
    if (!Number.isSafeInteger(opportunityId) || opportunityId < 1 || !fullName || fullName.length > 160 ||
        !emailPattern.test(email) || email.length > 254 || !phone || phone.length > 40 ||
        !motivation || motivation.length > 5000 || body.consent !== true) {
      return NextResponse.json({ error: "Complete the required fields and accept the privacy notice." }, { status: 400 });
    }
    for (const [field,max] of Object.entries(limits)) {
      if (typeof body[field] === "string" && body[field].length > max) return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 });
    }
    const portfolioUrl = clean(body.portfolioUrl);
    if (portfolioUrl) {
      try { const parsed = new URL(portfolioUrl); if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error(); }
      catch { return NextResponse.json({ error: "Enter a valid CV or portfolio link." }, { status: 400 }); }
    }
    if (!publicPool) return NextResponse.json({ error: "Public recruitment submission is not configured." }, { status: 503 });
    client = await publicPool.connect();
    await client.query("BEGIN");
    const emailHash = crypto.createHash("sha256").update(email).digest("hex");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [emailHash]);
    await client.query("DELETE FROM vsi_recruitment_submission_limits WHERE created_at < NOW() - INTERVAL '1 day'");
    const recent = await client.query("SELECT COUNT(*)::int AS count FROM vsi_recruitment_submission_limits WHERE email_hash=$1 AND created_at > NOW() - INTERVAL '1 hour'", [emailHash]);
    if (recent.rows[0].count >= 5) { await client.query("ROLLBACK"); return NextResponse.json({ error: "Too many applications from this email address. Please try again later." }, { status: 429 }); }
    const opportunity = await client.query("SELECT id FROM vsi_recruitment_opportunities WHERE id=$1 AND status='published' AND (closing_date IS NULL OR closing_date >= CURRENT_DATE)", [opportunityId]);
    if (!opportunity.rowCount) { await client.query("ROLLBACK"); return NextResponse.json({ error: "This opportunity is no longer accepting applications." }, { status: 404 }); }
    const reference = `VSI-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    await client.query("INSERT INTO vsi_recruitment_submission_limits (email_hash) VALUES ($1)", [emailHash]);
    await client.query(`INSERT INTO vsi_recruitment_applications
      (opportunity_id,reference_number,full_name,email,phone,location,education,current_occupation,experience,motivation,portfolio_url,consent_policy_version)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [opportunityId,reference,fullName,email,phone,clean(body.location),clean(body.education),clean(body.currentOccupation),clean(body.experience),motivation,portfolioUrl,policyVersion]);
    await client.query("COMMIT");
    return NextResponse.json({ ok:true, referenceNumber:reference }, { status:201 });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    console.error("Recruitment application:", error);
    return NextResponse.json({ error:"We could not submit your application. Please try again." }, { status:500 });
  } finally { client?.release(); }
}
