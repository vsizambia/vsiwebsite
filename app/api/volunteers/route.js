import { NextResponse } from "next/server";
import { ensureVolunteerTable, pool } from "../../../lib/db";

const clean = (value) => typeof value === "string" ? value.trim() : null;

export async function POST(request) {
  try {
    const body = await request.json();
    const required = ["fullName","email","phone","nationality","province","district","constituency","ward","category","skills","availability","motivation","referenceName","referenceOrganization","referencePhone","referenceEmail","emergencyName","emergencyPhone"];
    if (!required.every((field) => clean(body[field]))) return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    const age = Number(body.age);
    if (!Number.isInteger(age) || age < 1 || age > 120) return NextResponse.json({ error: "Please enter a valid age." }, { status: 400 });
    if (body.consent !== true) return NextResponse.json({ error: "Consent is required." }, { status: 400 });
    const elsewhere = body.volunteeringElsewhere === true;
    const convicted = body.criminalConviction === true;
    if (elsewhere && !clean(body.otherVolunteeringDetails)) return NextResponse.json({ error: "Please describe your current volunteering elsewhere." }, { status: 400 });
    if (convicted && !clean(body.criminalOffenceDetails)) return NextResponse.json({ error: "Please provide details of the disclosed conviction." }, { status: 400 });
    if (body.profilePicture && (typeof body.profilePicture !== "string" || !body.profilePicture.startsWith("data:image/") || body.profilePicture.length > 1200000)) return NextResponse.json({ error: "Please upload a smaller profile picture (maximum 1 MB)." }, { status: 400 });

    await ensureVolunteerTable();
    const result = await pool.query(
      `INSERT INTO volunteer_applications
       (full_name, age, nationality, email, phone, province, district, constituency, ward, location, current_occupation, education, category, skills, availability, motivation, volunteering_elsewhere, other_volunteering_details, past_volunteer_positions, reference_name, reference_organization, reference_phone, reference_email, criminal_conviction, criminal_offence_details, profile_picture, emergency_name, emergency_phone, consent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)
       RETURNING id, created_at`,
      [clean(body.fullName), age, clean(body.nationality), clean(body.email)?.toLowerCase(), clean(body.phone), clean(body.province), clean(body.district), clean(body.constituency), clean(body.ward), clean(body.location) || [clean(body.district), clean(body.province)].filter(Boolean).join(", "), clean(body.currentOccupation), clean(body.education), clean(body.category), clean(body.skills), clean(body.availability), clean(body.motivation), elsewhere, clean(body.otherVolunteeringDetails), clean(body.pastVolunteerPositions), clean(body.referenceName), clean(body.referenceOrganization), clean(body.referencePhone), clean(body.referenceEmail)?.toLowerCase(), convicted, clean(body.criminalOffenceDetails), body.profilePicture || null, clean(body.emergencyName), clean(body.emergencyPhone), true]
    );
    return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error("Volunteer application error:", error);
    const detail = process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined;
    return NextResponse.json({ error: "We could not submit your application. Please try again.", ...(detail ? { detail } : {}) }, { status: 500 });
  }
}
