import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { publicPool } from "../../../lib/db";

const RATE_LIMIT = 5;
const RATE_WINDOW = "1 hour";
const CONSENT_VERSION = "2026-10";
const CATEGORIES = {
  educational_materials: {
    label: "Educational Materials",
    items: {
      exercise_books: ["Exercise books", "Books", false],
      pens: ["Pens", "Pieces", false],
      pencils: ["Pencils", "Pieces", false],
      rulers: ["Rulers", "Pieces", false],
      crayon_packs: ["Crayon packs", "Packs", false],
      school_shoes: ["School shoes", "Pairs", true],
      school_bags_baby_nursery: ["School bags — baby class / nursery", "Bags", true],
      school_bags_primary: ["School bags — primary", "Bags", true],
    },
  },
  ovc_support: {
    label: "Orphan and Vulnerable Children (OVC) Support",
    items: {
      sugar_2kg: ["Sugar — 2 kg packs", "Packs", false],
      cooking_oil_2l: ["Cooking oil — 2 L", "Bottles", false],
      washing_powder_500g: ["Washing powder — 500 g", "Packs", false],
      toothpaste: ["Toothpaste", "Tubes / packs", false],
      bathing_soap: ["Bathing soap", "Bars / packs", false],
      basin_buckets: ["Basin buckets — 5 L to 10 L", "Buckets", false],
      mealie_meal_20kg: ["Mealie meal — 20 kg bags", "Bags", false],
    },
  },
  maternity_mothers: {
    label: "Maternity Ward Care — Mothers",
    items: {
      maternity_pads: ["Sanitary / maternity pads", "Packs", false],
      mothers_bathing_soap: ["Bathing soap bars", "Bars", false],
      mothers_hygiene_goods: ["Personal hygiene goods (soap, petroleum jelly / lotion, toothbrushes and toothpaste)", "Sets / items", false],
      laundry_detergent: ["Washing powder and laundry detergent", "Packs", false],
      chitenge_2m: ["Chitenge material — 2 metres", "Pieces", false],
      covered_buckets: ["Covered buckets — 10 L / 15 L", "Buckets", false],
      basins: ["Basins", "Pieces", false],
    },
  },
  maternity_newborns: {
    label: "Maternity Ward Care — Newborns",
    items: {
      newborn_diapers: ["Newborn diapers / reusable cloth nappies", "Packs / pieces", true],
      baby_soap: ["Baby soap", "Bars", false],
      baby_oil_jelly: ["Baby oil / petroleum jelly", "Bottles / tubs", false],
      receiving_blankets: ["Baby receiving blankets", "Pieces", true],
      receiving_wraps: ["Baby receiving wraps", "Pieces", true],
      baby_caps: ["Baby caps", "Pieces", true],
      baby_socks: ["Baby socks", "Pairs", true],
    },
  },
  other: {
    label: "Other",
    items: { other_item: ["Other (please specify)", "Items", true] },
  },
};

const clean = (value, max = 240) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
// Vercel overwrites x-real-ip with the client IP; do not trust client-supplied forwarding chains.
const getClientIp = request => request.headers.get("x-real-ip")?.trim() || "unknown";
const hashRateKey = ip => crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "vsi-generosity-rate-limit").update(ip).digest("hex");
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

async function allowSubmission(request) {
  const keyHash = hashRateKey(getClientIp(request));
  const result = await publicPool.query(
    "SELECT public.vsi_generosity_allow_submission($1,$2,$3) AS allowed",
    [keyHash, RATE_LIMIT, 60 * 60]
  );
  return result.rows[0]?.allowed === true;
}


async function verifyTurnstile(token) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { configured: false, valid: false };
  if (typeof token !== "string" || !token || token.length > 2048) {
    return { configured: true, valid: false };
  }
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { configured: true, valid: false };
    const result = await response.json();
    // Production submissions must use the canonical public site, not preview deployments.
    const allowedHostnames = new Set(["vsizambia.org", "www.vsizambia.org"]);
    return {
      configured: true,
      valid: result?.success === true
        && result?.action === "generosity-pledge"
        && allowedHostnames.has(result?.hostname),
    };
  } catch {
    return { configured: true, valid: false };
  }
}

function normaliseItems(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 30) throw new Error("Please select at least one item and check your quantities.");
  const seen = new Set();
  return value.map(row => {
    const category = clean(row?.category, 60);
    const itemKey = clean(row?.itemKey, 60);
    const definition = CATEGORIES[category]?.items?.[itemKey];
    const quantity = Number(row?.quantity);
    const sizeDetails = clean(row?.sizeDetails, 160);
    const otherItem = category === "other" && itemKey === "other_item";
    if (!definition || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 1000000) throw new Error("Please check each selected item and enter a whole-number quantity greater than zero.");
    if (otherItem && !sizeDetails) throw new Error("Please describe the item you have selected under Other.");
    const composite = category + ":" + itemKey;
    if (seen.has(composite)) throw new Error("Each item can only be selected once.");
    seen.add(composite);
    if (!definition[2] && sizeDetails) throw new Error("Size details are only accepted for items that need sizing or age information.");
    return {
      id: crypto.randomUUID(),
      category,
      itemKey,
      itemLabel: otherItem ? `Other: ${sizeDetails}` : definition[0],
      unit: definition[1],
      quantity,
      sizeDetails: definition[2] && !otherItem ? sizeDetails || null : null,
    };
  });
}

async function sendVerificationEmail({ email, firstName, reference, token, siteOrigin }) {
  if (!process.env.RESEND_API_KEY || !process.env.VOLUNTEER_PORTAL_FROM_EMAIL) {
    throw new Error("Email delivery is not configured.");
  }
  const verifyUrl = new URL("/api/generosity/verify", siteOrigin);
  verifyUrl.searchParams.set("token", token);
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#18324b"><h1 style="color:#07365f">Verify your VSI Generosity pledge</h1><p>Hello ${escapeHtml(firstName)},</p><p>We received a goods pledge using this email address. To confirm that you control this address, please verify it using the button below. Your pledge reference is <strong>${escapeHtml(reference)}</strong>.</p><p style="margin:28px 0"><a href="${escapeHtml(verifyUrl.toString())}" style="background:#07365f;color:#fff;padding:13px 20px;text-decoration:none;border-radius:5px;display:inline-block">Verify my email address</a></p><p>This link expires in 24 hours and can only be used once. Your pledge will remain unverified until you complete this step.</p><p>If you did not submit this pledge, you can ignore this message.</p><p>With gratitude,<br/>Visionary Students Initiative (VSI)</p></div>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.VOLUNTEER_PORTAL_FROM_EMAIL,
      to: [email],
      subject: `Verify your VSI Generosity pledge — ${reference}`,
      html,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Resend returned HTTP ${response.status}`);
}

export async function POST(request) {
  if (!publicPool) return NextResponse.json({ error: "Generosity submissions are temporarily unavailable." }, { status: 503 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please submit a valid form." }, { status: 400 }); }
  // Honeypot field: silently accept bot submissions without storing them.
  if (clean(body?.website, 200)) return NextResponse.json({ ok: true, reference: null }, { status: 201 });

  const turnstile = await verifyTurnstile(body?.turnstileToken);
  if (!turnstile.configured) {
    return NextResponse.json({ error: "The security check is temporarily unavailable. Please try again later." }, { status: 503 });
  }
  if (!turnstile.valid) {
    return NextResponse.json({ error: "Please complete the security check and try again." }, { status: 400 });
  }

  const firstName = clean(body?.firstName, 80);
  const lastName = clean(body?.lastName, 80);
  const gender = clean(body?.gender, 40) || null;
  const ageRange = clean(body?.ageRange, 40) || null;
  const email = clean(body?.email, 254).toLowerCase();
  const phone = clean(body?.phone, 40);
  const phoneDigits = phone.replace(/\D/g, "").replace(/^260/, "").replace(/^0/, "");
  const zambiaPhone = "+260" + phoneDigits;
  const townArea = clean(body?.townArea, 120);
  const pickupAddress = clean(body?.pickupAddress, 300) || null;
  const additionalInformation = clean(body?.additionalInformation, 2000) || null;
  const phoneConsent = body?.phoneConsent === true;
  const emailConsent = body?.emailConsent === true;
  if (!firstName || !lastName || !email || phoneDigits.length !== 9 || !townArea || !validEmail(email)) {
    return NextResponse.json({ error: "Please provide your first name, last name, valid email, a valid Zambian phone number and town / area." }, { status: 400 });
  }
  let items;
  try { items = normaliseItems(body?.items); } catch (error) {
    return NextResponse.json({ error: error.message || "Please check your selected items." }, { status: 400 });
  }
  if (items.reduce((sum, item) => sum + item.quantity, 0) > 10000000) {
    return NextResponse.json({ error: "The combined quantities are too large. Please check your entries." }, { status: 400 });
  }

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  let client;
  let offer;
  try {
    if (!await allowSubmission(request)) return NextResponse.json({ error: "Too many submissions from this connection. Please try again later." }, { status: 429 });
    client = await publicPool.connect();
    await client.query("BEGIN");
    const id = crypto.randomUUID();
    const reference = `VSI-GEN-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex");
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await client.query(
      `INSERT INTO public.vsi_generosity_offers
       (id,reference,first_name,last_name,gender,age_range,email,phone,town_area,pickup_address,phone_consent,email_consent,consent_version,additional_information)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [id,reference,firstName,lastName,gender,ageRange,email,zambiaPhone,townArea,pickupAddress,phoneConsent,emailConsent,CONSENT_VERSION,additionalInformation]
    );
    for (const item of items) {
      await client.query(
        `INSERT INTO public.vsi_generosity_offer_items
         (id,offer_id,category,item_key,item_label,quantity_pledged,unit,size_details)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [item.id,id,item.category,item.itemKey,item.itemLabel,item.quantity,item.unit,item.sizeDetails]
      );
    }
    const verification = await client.query(
      "SELECT public.vsi_generosity_create_email_verification($1,$2,$3) AS created",
      [id, verificationTokenHash, verificationExpiresAt]
    );
    if (verification.rows[0]?.created !== true) throw new Error("Unable to create the email verification request.");
    await client.query("COMMIT");
    offer = { reference, firstName, email, townArea, verificationToken };
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    console.error("VSI Generosity submission failed:", error);
    return NextResponse.json({ error: "We could not save your pledge. Please try again or contact VSI." }, { status: 500 });
  } finally {
    client?.release();
  }

  let emailSent = false;
  try {
    const requestHost = request.headers.get("host") || "";
    const isCanonicalHost = ["www.vsizambia.org", "vsizambia.org"].includes(requestHost.split(":")[0].toLowerCase());
    const siteOrigin = isCanonicalHost ? `https://${requestHost.split(":")[0].toLowerCase()}` : "https://www.vsizambia.org";
    await sendVerificationEmail({ email, firstName, reference: offer.reference, token: offer.verificationToken, siteOrigin });
    emailSent = true;
  } catch (error) {
    console.error("VSI Generosity confirmation email failed:", { reference: offer.reference, message: error.message });
  }
  return NextResponse.json({
    ok: true,
    reference: offer.reference,
    emailSent,
    totalUnits,
    emailVerified: false,
    message: emailSent
      ? "Your pledge is awaiting email verification. Please open the verification link we sent to your email address to confirm that you own it."
      : "Your pledge has been saved but is not yet confirmed because the verification email could not be sent. Please contact VSI and quote your reference number.",
  }, { status: 201 });
}

export const GENEROSITY_CATALOGUE = CATEGORIES;
