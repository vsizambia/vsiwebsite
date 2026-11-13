import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { dataProtectionPublicPool } from "../../../lib/db";

export const runtime = "nodejs";

const clean = value => typeof value === "string" ? value.trim() : "";
const allowed = new Set(["access", "correction", "deletion", "withdraw_consent", "processing_information", "complaint"]);
const MAX_BODY_BYTES = 16 * 1024;

export async function POST(request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Your request is too large. Please shorten the details and try again." }, { status: 413 });
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Your request is too large. Please shorten the details and try again." }, { status: 413 });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Please submit a valid request." }, { status: 400 });
    }

    const requestType = clean(body?.requestType);
    const requesterName = clean(body?.requesterName);
    const requesterEmail = clean(body?.requesterEmail).toLowerCase();
    const details = clean(body?.details);

    if (
      !allowed.has(requestType) ||
      !requesterName ||
      requesterName.length > 200 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requesterEmail) ||
      requesterEmail.length > 254 ||
      details.length > 10000
    ) {
      return NextResponse.json({ error: "Please provide a valid request type, name and email address. Keep details under 10,000 characters." }, { status: 400 });
    }

    // Vercel supplies x-real-ip. Do not trust the client-controlled first
    // X-Forwarded-For entry for abuse controls.
    const clientIp = request.headers.get("x-real-ip")?.trim();
    const rateLimitSecret = process.env.DATA_PROTECTION_RATE_LIMIT_SECRET;
    if (!clientIp || !rateLimitSecret || rateLimitSecret.length < 32) {
      console.error("Data protection request security configuration is incomplete.");
      return NextResponse.json({ error: "The request service is temporarily unavailable. Please try again later." }, { status: 503 });
    }

    const ipHash = createHmac("sha256", rateLimitSecret).update(clientIp).digest("hex");
    const result = await dataProtectionPublicPool.query(
      "SELECT * FROM public.vsi_submit_data_protection_request($1, $2, $3, $4, $5)",
      [ipHash, requestType, requesterName, requesterEmail, details || null]
    );

    return NextResponse.json({ ok: true, request: result.rows[0] }, { status: 201 });
  } catch (error) {
    if (error?.message === "RATE_LIMITED") {
      return NextResponse.json(
        { error: "Too many requests have been submitted from this connection. Please wait 15 minutes before trying again." },
        { status: 429, headers: { "Retry-After": "900" } }
      );
    }

    console.error("Data protection request error:", error);
    return NextResponse.json({ error: "Unable to submit your request. Please try again later." }, { status: 500 });
  }
}
