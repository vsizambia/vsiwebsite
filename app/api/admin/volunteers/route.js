import { NextResponse } from "next/server";
import { ensureVolunteerTable, pool } from "../../../../lib/db";

export async function GET() {
  try {
    await ensureVolunteerTable();
    const result = await pool.query(
      `SELECT id, full_name, email, phone, location, category, skills, availability,
              motivation, emergency_name, emergency_phone, status, created_at, updated_at
       FROM volunteer_applications
       ORDER BY created_at DESC`,
    );
    return NextResponse.json({ applications: result.rows });
  } catch (error) {
    console.error("Volunteer admin error:", error);
    return NextResponse.json({ error: "Unable to load volunteer applications." }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, status } = await request.json();
    const allowed = ["pending", "approved", "rejected", "inactive"];

    if (!id || !allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid volunteer status update." }, { status: 400 });
    }

    await ensureVolunteerTable();
    const result = await pool.query(
      `UPDATE volunteer_applications
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, status`,
      [status, id],
    );

    if (!result.rowCount) {
      return NextResponse.json({ error: "Volunteer application not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, volunteer: result.rows[0] });
  } catch (error) {
    console.error("Volunteer status error:", error);
    return NextResponse.json({ error: "Unable to update volunteer status." }, { status: 500 });
  }
}
