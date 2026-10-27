import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { safeguardingPublicPool } from "../../../../lib/db";

const categories = new Set(["abuse","neglect","exploitation","sexual_exploitation_abuse","harassment","bullying","unsafe_practice","retaliation","other"]);
const reporterTypes = new Set(["affected_person","witness","parent_guardian","staff_volunteer","partner","other"]);
const affectedTypes = new Set(["child","programme_participant","volunteer","staff","partner","other","unknown"]);
const ageBands = new Set(["under_13","13_17","18_plus","unknown"]);
const clean = (v, max=5000) => typeof v === "string" ? v.trim().slice(0,max) : "";
const hashIp = (request) => {
  const ip = (request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Rate-limit secret is not configured.");
  return crypto.createHmac("sha256", secret).update(ip).digest("hex");
};

export async function POST(request) {
  if (!process.env.SAFEGUARDING_PUBLIC_DATABASE_URL) return NextResponse.json({ error: "The confidential reporting service is temporarily unavailable. Please use another trusted VSI safeguarding contact channel." }, { status: 503 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 20000) return NextResponse.json({ error: "The report is too large. Please shorten it and try again." }, { status: 413 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please submit a valid report." }, { status: 400 }); }
  if (clean(body.website, 200)) return NextResponse.json({ ok: true, reference: "Received" });
  const reporterType = clean(body.reporterType, 40);
  const affectedType = clean(body.affectedPersonType, 40);
  const category = clean(body.concernCategory, 60);
  const details = clean(body.concernDetails, 5000);
  const anonymous = body.anonymous === true;
  const reporterName = anonymous ? null : clean(body.reporterName, 160) || null;
  const reporterContact = anonymous ? null : clean(body.reporterContact, 200) || null;
  const safeContactMethod = anonymous ? null : clean(body.safeContactMethod, 60) || null;
  const ageBand = clean(body.affectedPersonAgeBand, 30) || "unknown";
  const incidentDate = clean(body.incidentDate, 10);
  if (!reporterTypes.has(reporterType) || !affectedTypes.has(affectedType) || !categories.has(category) || !ageBands.has(ageBand) || details.length < 20) {
    return NextResponse.json({ error: "Please complete the required fields and provide enough information for VSI to understand the concern." }, { status: 400 });
  }
  if (incidentDate && !/^\d{4}-\d{2}-\d{2}$/.test(incidentDate)) return NextResponse.json({ error: "Please enter a valid incident date." }, { status: 400 });
  let client;
  try {
    const keyHash = hashIp(request);
    client = await safeguardingPublicPool.connect();
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [keyHash]);
    await client.query("DELETE FROM safeguarding_public_rate_limits WHERE created_at < NOW() - INTERVAL '24 hours'");
    const count = await client.query("SELECT COUNT(*)::int AS count FROM safeguarding_public_rate_limits WHERE key_hash=$1 AND created_at >= NOW() - INTERVAL '1 hour'", [keyHash]);
    if (count.rows[0].count >= 3) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "For safety, the reporting form has a short submission limit. If the matter is urgent, contact emergency services or a trusted safeguarding authority directly." }, { status: 429 });
    }
    await client.query("INSERT INTO safeguarding_public_rate_limits (key_hash) VALUES ($1)", [keyHash]);
    const reference = "VSI-SG-" + new Date().toISOString().slice(0,10).replaceAll("-","") + "-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    await client.query(
      `INSERT INTO safeguarding_reports
       (case_reference, reporter_type, anonymous, reporter_name, reporter_contact, safe_contact_method,
        affected_person_type, affected_person_age_band, concern_category, concern_details, incident_date,
        immediate_danger, safe_to_contact)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [reference, reporterType, anonymous, reporterName, reporterContact, safeContactMethod, affectedType, ageBand, category, details, incidentDate || null, body.immediateDanger === true, body.safeToContact === true]
    );
    await client.query("COMMIT");
    return NextResponse.json({ ok: true, reference }, { status: 201 });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    console.error("Safeguarding submission failed:", error?.message || "unknown error");
    return NextResponse.json({ error: "We could not securely submit your report just now. Please try again later or use another trusted safeguarding contact channel." }, { status: 503 });
  } finally {
    client?.release();
  }
}
