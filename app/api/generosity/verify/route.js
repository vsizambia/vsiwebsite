import crypto from "node:crypto";
import { pool } from "../../../../lib/db";

const htmlEscape = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const page = (title, message, form = "") => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>${htmlEscape(title)} | VSI Generosity</title><style>body{font-family:Arial,sans-serif;background:#f3f6f9;color:#18324b;margin:0;padding:32px 16px}.card{max-width:560px;margin:8vh auto;background:white;border-radius:14px;padding:32px;box-shadow:0 8px 32px #18324b12}h1{color:#07365f}p{line-height:1.6}button{background:#07365f;color:white;border:0;border-radius:6px;padding:13px 20px;font-size:16px;cursor:pointer}a{color:#07365f}</style></head><body><main class="card"><p><strong>VISIONARY STUDENTS INITIATIVE</strong></p><h1>${htmlEscape(title)}</h1><p>${htmlEscape(message)}</p>${form}<p>With gratitude,<br>Visionary Students Initiative (VSI)</p></main></body></html>`;
const headers = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store, max-age=0", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow" };

async function sendVerifiedConfirmation({ offer, items }) {
  if (!process.env.RESEND_API_KEY || !process.env.VOLUNTEER_PORTAL_FROM_EMAIL) {
    throw new Error("Email delivery is not configured.");
  }
  const lines = items.map(item => `<tr><td style="padding:9px;border-bottom:1px solid #e5eaf0">${htmlEscape(item.item_label)}</td><td style="padding:9px;text-align:right;border-bottom:1px solid #e5eaf0">${Number(item.quantity_pledged).toLocaleString()} ${htmlEscape(item.unit)}</td></tr>`).join("");
  const totalUnits = items.reduce((sum, item) => sum + Number(item.quantity_pledged), 0);
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#18324b"><h1 style="color:#07365f">Your email is verified</h1><p>Hello ${htmlEscape(offer.first_name)},</p><p>Thank you. Your email address has been verified and your VSI Generosity pledge is confirmed in our register. Your reference number is <strong>${htmlEscape(offer.reference)}</strong>.</p><table style="border-collapse:collapse;width:100%"><thead><tr><th align="left" style="padding:9px;background:#f2f6fa">Item</th><th align="right" style="padding:9px;background:#f2f6fa">Quantity pledged</th></tr></thead><tbody>${lines}<tr><td style="padding:12px 9px;background:#f2f6fa;font-weight:bold">Total units pledged</td><td style="padding:12px 9px;background:#f2f6fa;text-align:right;font-weight:bold">${totalUnits.toLocaleString()}</td></tr></tbody></table><p><strong>Collection area:</strong> ${htmlEscape(offer.town_area)}</p>${offer.additional_information ? `<p><strong>Additional information:</strong><br>${htmlEscape(offer.additional_information).replace(/\n/g,"<br>")}</p>` : ""}<p>Please purchase only the goods you pledged. VSI will contact you to coordinate pickup. This is a goods-only initiative; no money is requested or processed through this form.</p><p>With gratitude,<br>Visionary Students Initiative (VSI)</p></div>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.VOLUNTEER_PORTAL_FROM_EMAIL, to: [offer.email], subject: `VSI Generosity pledge confirmed — ${offer.reference}`, html }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Resend returned HTTP ${response.status}`);
}

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!/^[0-9a-f]{64}$/.test(token)) {
    return new Response(page("Invalid verification link", "This verification link is missing or invalid. Please use the complete link from your VSI email."), { status: 400, headers });
  }
  const form = `<form method="post" action="/api/generosity/verify"><input type="hidden" name="token" value="${htmlEscape(token)}"><button type="submit">Verify my email address</button></form>`;
  return new Response(page("Verify your email address", "To confirm that you control the email address used for this pledge, select the button below. This link expires after 24 hours and can only be used once.", form), { status: 200, headers });
}

export async function POST(request) {
  let token = "";
  try {
    const type = request.headers.get("content-type") || "";
    if (type.includes("application/json")) {
      const body = await request.json();
      token = typeof body?.token === "string" ? body.token : "";
    } else {
      const form = await request.formData();
      token = String(form.get("token") || "");
    }
  } catch {
    return new Response(page("Unable to verify email", "The verification request was invalid. Please open the link from your email and try again."), { status: 400, headers });
  }
  if (!/^[0-9a-f]{64}$/.test(token)) {
    return new Response(page("Invalid verification link", "This verification link is missing or invalid. Please use the complete link from your VSI email."), { status: 400, headers });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  let client;
  let offer;
  let items = [];
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const found = await client.query(
      `SELECT v.id AS verification_id,v.offer_id,o.reference,o.first_name,o.email,o.town_area,o.additional_information
       FROM public.vsi_generosity_email_verifications v
       JOIN public.vsi_generosity_offers o ON o.id=v.offer_id
       WHERE v.token_hash=$1 AND v.used_at IS NULL AND v.expires_at>NOW() AND o.email_verified_at IS NULL
       FOR UPDATE OF v,o`,
      [tokenHash]
    );
    if (!found.rowCount) {
      await client.query("ROLLBACK");
      return new Response(page("Link expired or already used", "This verification link has expired, was already used, or the email address has already been verified. If you still need help, contact VSI and quote your pledge reference."), { status: 410, headers });
    }
    offer = found.rows[0];
    await client.query("UPDATE public.vsi_generosity_email_verifications SET used_at=NOW() WHERE id=$1", [offer.verification_id]);
    await client.query("UPDATE public.vsi_generosity_offers SET email_verified_at=NOW(),updated_at=NOW() WHERE id=$1", [offer.offer_id]);
    const itemRows = await client.query(
      "SELECT item_label,quantity_pledged,unit FROM public.vsi_generosity_offer_items WHERE offer_id=$1 ORDER BY category,item_label",
      [offer.offer_id]
    );
    items = itemRows.rows;
    await client.query("COMMIT");
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    console.error("VSI Generosity email verification failed:", error);
    return new Response(page("Verification temporarily unavailable", "We could not verify your email just now. Please try again shortly. Your link has not been consumed unless verification completed successfully."), { status: 503, headers });
  } finally {
    client?.release();
  }

  let confirmationSent = false;
  try {
    await sendVerifiedConfirmation({ offer, items });
    confirmationSent = true;
  } catch (error) {
    console.error("VSI Generosity verified confirmation email failed:", { reference: offer.reference, message: error.message });
  }
  const message = confirmationSent
    ? `Your email address has been verified and pledge ${offer.reference} is confirmed. A confirmation email has been sent to your inbox.`
    : `Your email address has been verified and pledge ${offer.reference} is confirmed. The confirmation email could not be sent just now; please keep your reference number.`;
  return new Response(page("Email verified successfully", message, '<p><a href="https://www.vsizambia.org/generosity">Return to VSI Generosity</a></p>'), { status: 200, headers });
}
