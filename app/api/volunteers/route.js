import { NextResponse } from "next/server";
import { ensureVolunteerTable, pool } from "../../../lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const required = [
      "fullName",
      "email",
      "phone",
      "location",
      "category",
      "skills",
      "availability",
      "motivation",
      "emergencyName",
      "emergencyPhone",
    ];

    if (!required.every((field) => typeof body[field] === "string" && body[field].trim())) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    if (body.consent !== true) {
      return NextResponse.json({ error: "Consent is required." }, { status: 400 });
    }

    await ensureVolunteerTable();

    const result = await pool.query(
      `INSERT INTO volunteer_applications
        (full_name, email, phone, location, category, skills, availability, motivation, emergency_name, emergency_phone, consent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id, created_at`,
      [
        body.fullName.trim(),
        body.email.trim().toLowerCase(),
        body.phone.trim(),
        body.location.trim(),
        body.category.trim(),
        body.skills.trim(),
        body.availability.trim(),
        body.motivation.trim(),
        body.emergencyName.trim(),
        body.emergencyPhone.trim(),
        true,
      ],
    );

    return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error("Volunteer application error:", error);
    return NextResponse.json({ error: "We could not submit your application. Please try again." }, { status: 500 });
  }
}
