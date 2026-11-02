import crypto from "node:crypto";
import { pool } from "../../../../lib/db";

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const page = (title,message,form="") => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>${escapeHtml(title)} | VSI Recruitment</title><style>body{font-family:Arial,sans-serif;background:#f3f6f9;color:#18324b;margin:0;padding:32px 16px}.card{max-width:580px;margin:8vh auto;background:#fff;border-radius:14px;padding:32px;box-shadow:0 8px 32px #18324b12}h1{color:#07365f}p{line-height:1.65}button,.link{background:#07365f;color:#fff;border:0;border-radius:6px;padding:13px 20px;font-size:16px;cursor:pointer;text-decoration:none;display:inline-block}.muted{color:#60758a;font-size:14px}</style></head><body><main class="card"><p><strong>VISIONARY STUDENTS INITIATIVE</strong></p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>${form}<p class="muted">Kind regards,<br>Visionary Students Initiative (VSI)</p></main></body></html>`;
const headers={"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store, max-age=0","Referrer-Policy":"no-referrer","X-Content-Type-Options":"nosniff","X-Robots-Tag":"noindex, nofollow"};

async function sendVerifiedEmail(application) {
  if(!process.env.RESEND_API_KEY||!process.env.VOLUNTEER_PORTAL_FROM_EMAIL) throw new Error("Email delivery is not configured.");
  const html=`<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#18324b"><h1 style="color:#07365f">Your VSI application is confirmed</h1><p>Hello ${escapeHtml(application.full_name)},</p><p>Your email address has been verified and your application has been received by Visionary Students Initiative. Your application reference is <strong>${escapeHtml(application.reference_number)}</strong>.</p><p>The VSI team will review your application and contact you if you are shortlisted or if further information is required.</p><p>Thank you for your interest in contributing to VSI's work.</p><p>Kind regards,<br>Visionary Students Initiative (VSI)</p></div>`;
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.VOLUNTEER_PORTAL_FROM_EMAIL,to:[application.email],subject:`VSI application received — ${application.reference_number}`,html}),signal:AbortSignal.timeout(10000)});
  if(!response.ok) throw new Error(`Resend returned HTTP ${response.status}`);
}

export async function GET(request) {
  const token=new URL(request.url).searchParams.get("token")||"";
  if(!/^[0-9a-f]{64}$/.test(token)) return new Response(page("Invalid verification link","This verification link is missing or invalid. Please use the complete link sent to your email address."),{status:400,headers});
  const form=`<form method="post" action="/api/recruitment/verify"><input type="hidden" name="token" value="${escapeHtml(token)}"><button type="submit">Verify my email address</button></form>`;
  return new Response(page("Confirm your email address","To confirm that you control the email address used for your VSI application, select the button below. This link expires after 24 hours and can only be used once.",form),{status:200,headers});
}

export async function POST(request) {
  let token="";
  try {
    const type=request.headers.get("content-type")||"";
    if(type.includes("application/json")) { const body=await request.json(); token=typeof body?.token==="string"?body.token:""; }
    else { const form=await request.formData(); token=String(form.get("token")||""); }
  } catch { return new Response(page("Unable to verify email","The verification request was invalid. Please open the link from your email and try again."),{status:400,headers}); }
  if(!/^[0-9a-f]{64}$/.test(token)) return new Response(page("Invalid verification link","This verification link is missing or invalid. Please use the complete link sent to your email address."),{status:400,headers});

  const tokenHash=crypto.createHash("sha256").update(token).digest("hex");
  let client;
  let application;
  try {
    client=await pool.connect();
    await client.query("BEGIN");
    const found=await client.query(`SELECT v.id AS verification_id,v.application_id,a.reference_number,a.full_name,a.email
      FROM public.vsi_recruitment_email_verifications v
      JOIN public.vsi_recruitment_applications a ON a.id=v.application_id
      WHERE v.token_hash=$1 AND v.used_at IS NULL AND v.expires_at>NOW() AND a.email_verified_at IS NULL
      FOR UPDATE OF v,a`,[tokenHash]);
    if(!found.rowCount) {
      await client.query("ROLLBACK");
      return new Response(page("Link expired or already used","This verification link has expired, was already used, or the email address has already been verified. If you need help, contact VSI and quote your application reference."),{status:410,headers});
    }
    application=found.rows[0];
    await client.query("UPDATE public.vsi_recruitment_email_verifications SET used_at=NOW() WHERE id=$1",[application.verification_id]);
    await client.query("UPDATE public.vsi_recruitment_applications SET email_verified_at=NOW(),updated_at=NOW() WHERE id=$1",[application.application_id]);
    await client.query("COMMIT");
  } catch(error) {
    if(client) await client.query("ROLLBACK").catch(()=>{});
    console.error("VSI Recruitment email verification failed:",error);
    return new Response(page("Verification temporarily unavailable","We could not verify your email just now. Please try again shortly. Your link has not been consumed unless verification completed successfully."),{status:503,headers});
  } finally { client?.release(); }

  let confirmationSent=false;
  try { await sendVerifiedEmail(application); confirmationSent=true; }
  catch(error) { console.error("VSI Recruitment verified confirmation email failed:",{reference:application.reference_number,message:error.message}); }
  const message=confirmationSent
    ? `Your email address has been verified and your application ${application.reference_number} has been received successfully. A confirmation email has also been sent to your inbox.`
    : `Your email address has been verified and your application ${application.reference_number} has been received successfully. Please keep your reference number for your records.`;
  return new Response(page("Thank you — your application is confirmed",message,'<a class="link" href="https://www.vsizambia.org/recruitment">Return to VSI Recruitment</a>'),{status:200,headers});
}
