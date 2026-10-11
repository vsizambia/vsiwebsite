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
      exercise_books: ["Exercise books", "Books", true],
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
      mealie_meal_20kg: ["Mealie meal — 20 kg bags", "Bags", false],
    },
  },
  maternity_mothers: {
    label: "Maternity Ward Care — Mothers",
    items: {
      maternity_pads: ["Sanitary / maternity pads", "Packs", false],
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
};

const clean = (value, max = 240) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const getClientIp = request => (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
const hashRateKey = ip => crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "vsi-generosity-rate-limit").update(ip).digest("hex");
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

async function allowSubmission(request) {
  const keyHash = hashRateKey(getClientIp(request));
  const client = await publicPool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [keyHash]);
    await client.query("DELETE FROM public.vsi_generosity_rate_limits WHERE created_at < NOW() - INTERVAL '1 hour'");
    const count = await client.query("SELECT COUNT(*)::int AS count FROM public.vsi_generosity_rate_limits WHERE key_hash=$1 AND created_at >= NOW() - INTERVAL '1 hour'", [keyHash]);
    if (count.rows[0].count >= RATE_LIMIT) {
      await client.query("ROLLBACK");
      return false;
    }
    await client.query("INSERT INTO public.vsi_generosity_rate_limits (key_hash) VALUES ($1)", [keyHash]);
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
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
    if (!definition || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 1000000) throw new Error("Please check each selected item and enter a whole-number quantity greater than zero.");
    const composite = category + ":" + itemKey;
    if (seen.has(composite)) throw new Error("Each item can only be selected once.");
    seen.add(composite);
    if (!definition[2] && sizeDetails) throw new Error("Size details are only accepted for items that need sizing or age information.");
    return {
      id: crypto.randomUUID(),
      category,
      itemKey,
      itemLabel: definition[0],
      unit: definition[1],
      quantity,
      sizeDetails: definition[2] ? sizeDetails || null : null,
    };
  });
}

async function sendConfirmation({ email, firstName, reference, items, townArea }) {
  if (!process.env.RESEND_API_KEY || !process.env.VOLUNTEER_PORTAL_FROM_EMAIL) {
    throw new Error("Email delivery is not configured.");
  }
  const lines = items.map(item => `<tr><td style="padding:9px;border-bottom:1px solid #e5eaf0">${escapeHtml(item.itemLabel)}</td><td style="padding:9px;text-align:right;border-bottom:1px solid #e5eaf0">${item.quantity.toLocaleString()} ${escapeHtml(item.unit)}</td></tr>`).join("");
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#18324b"><h1 style="color:#07365f">Thank you for your generosity</h1><p>Hello ${escapeHtml(firstName)},</p><p>VSI has received your offer of goods. Your reference number is <strong>${escapeHtml(reference)}</strong>.</p><table style="border-collapse:collapse;width:100%"><thead><tr><th align="left" style="padding:9px;background:#f2f6fa">Item</th><th align="right" style="padding:9px;background:#f2f6fa">Quantity pledged</th></tr></thead><tbody>${lines}</tbody></table><p><strong>Collection area:</strong> ${escapeHtml(townArea)}</p><p>Please purchase the items you have offered. VSI will contact you to coordinate pickup. This is a goods-only initiative; no money is requested or processed through this form.</p><p>With gratitude,<br/>Visionary Students Initiative (VSI)</p></div>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.VOLUNTEER_PORTAL_FROM_EMAIL,
      to: [email],
      subject: `VSI Generosity offer received — ${reference}`,
      html,
    }),
  });
  if (!response.ok) throw new Error(`Resend returned HTTP ${response.status}`);
}

export async function POST(request) {
  if (!publicPool) return NextResponse.json({ error: "Generosity submissions are temporarily unavailable." }, { status: 503 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Please submit a valid form." }, { status: 400 }); }
  // Honeypot field: silently accept bot submissions without storing them.
  if (clean(body?.website, 200)) return NextResponse.json({ ok: true, reference: null }, { status: 201 });

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

  let client;
  let offer;
  try {
    if (!await allowSubmission(request)) return NextResponse.json({ error: "Too many submissions from this connection. Please try again later." }, { status: 429 });
    client = await publicPool.connect();
    await client.query("BEGIN");
    const id = crypto.randomUUID();
    const reference = `VSI-GEN-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const inserted = await client.query(
      `INSERT INTO public.vsi_generosity_offers
       (id,reference,first_name,last_name,gender,age_range,email,phone,town_area,pickup_address,phone_consent,email_consent,consent_version)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id,reference,created_at`,
      [id,reference,firstName,lastName,gender,ageRange,email,zambiaPhone,townArea,pickupAddress,phoneConsent,emailConsent,CONSENT_VERSION]
    );
    for (const item of items) {
      await client.query(
        `INSERT INTO public.vsi_generosity_offer_items
         (id,offer_id,category,item_key,item_label,quantity_pledged,unit,size_details)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [item.id,id,item.category,item.itemKey,item.itemLabel,item.quantity,item.unit,item.sizeDetails]
      );
    }
    await client.query("COMMIT");
    offer = { ...inserted.rows[0], firstName, email, townArea };
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    console.error("VSI Generosity submission failed:", error);
    return NextResponse.json({ error: "We could not save your offer. Please try again or contact VSI." }, { status: 500 });
  } finally {
    client?.release();
  }

  let emailSent = false;
  try {
    await sendConfirmation({ email, firstName, reference: offer.reference, items, townArea });
    emailSent = true;
  } catch (error) {
    console.error("VSI Generosity confirmation email failed:", { reference: offer.reference, message: error.message });
  }
  return NextResponse.json({
    ok: true,
    reference: offer.reference,
    emailSent,
    message: emailSent
      ? "Your offer has been recorded. A confirmation email with your reference number has been sent."
      : "Your offer has been recorded. Please keep your reference number; the confirmation email could not be sent just now.",
  }, { status: 201 });
}

export const GENEROSITY_CATALOGUE = CATEGORIES;
