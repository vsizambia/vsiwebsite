import { NextResponse } from "next/server";
import { ensureVolunteerTable, pool } from "../../../../lib/db";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

function unauthorized() {
  return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
}

export async function GET(request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  try {
    await ensureVolunteerTable();
    const result = await pool.query(
      `SELECT id, full_name, age, email, phone, location, current_occupation, education,
              category, skills, availability, motivation, emergency_name, emergency_phone,
              status, rejection_reason, rejection_note, reviewed_at, created_at, updated_at
       FROM volunteer_applications ORDER BY created_at DESC`,
    );
    return NextResponse.json({ applications: result.rows });
  } catch (error) {
    console.error("Volunteer admin error:", error);
    return NextResponse.json({ error: "Unable to load volunteer applications." }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  try {
    const { id, status, rejectionReason, rejectionNote } = await request.json();
    const allowed = ["pending", "approved", "rejected", "inactive"];
    const reasons = ["age_eligibility", "recruitment_closed", "incomplete_application", "role_fit", "safeguarding", "capacity", "other"];
    if (!id || !allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid volunteer status update." }, { status: 400 });
    }
    if (status === "rejected" && !reasons.includes(rejectionReason)) {
      return NextResponse.json({ error: "Please select a reason for rejection." }, { status: 400 });
    }
    await ensureVolunteerTable();
    const result = await pool.query(
      `UPDATE volunteer_applications
       SET status = $1,
           rejection_reason = CASE WHEN $1 = 'rejected' THEN $2 ELSE NULL END,
           rejection_note = CASE WHEN $1 = 'rejected' THEN NULLIF($3, '') ELSE NULL END,
           reviewed_at = CASE WHEN $1 IN ('approved','rejected','inactive') THEN NOW() ELSE reviewed_at END,
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, status, rejection_reason, rejection_note, reviewed_at`,
      [status, rejectionReason || null, typeof rejectionNote === "string" ? rejectionNote.trim() : "", id],
    );
    if (!result.rowCount) return NextResponse.json({ error: "Volunteer application not found." }, { status: 404 });
    return NextResponse.json({ ok: true, volunteer: result.rows[0] });
  } catch (error) {
    console.error("Volunteer status error:", error);
    return NextResponse.json({ error: "Unable to update volunteer status." }, { status: 500 });
  }
}
