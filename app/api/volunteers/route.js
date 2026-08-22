import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { ensureVolunteerTable, pool } from "../../../lib/db";

const clean = (value) => typeof value === "string" ? value.trim() : null;

async function storeProfilePicture(dataUrl, volunteerId) {
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match) throw new Error("Invalid profile picture format.");
  const contentType = match[1] === "image/png" ? "image/png" : "image/jpeg";
  const extension = contentType === "image/png" ? "png" : "jpg";
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 1000000) throw new Error("Please upload a smaller profile picture (maximum 1 MB).");
  const blob = await put(`volunteers/${volunteerId}/profile.${extension}`, buffer, {
    access: "private",
    contentType,
    addRandomSuffix: true,
  });
  return blob.url;
}

function parseDateOfBirth(value) {
  const raw = clean(value);
  if (!raw) return null;
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) return null;
  const iso = `${year}-${month}-${day}`;
  const today = new Date();
  const dob = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (dob > new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))) return null;
  return iso;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const required = ["fullName","dateOfBirth","nationality","gender","faith","email","phone","province","district","constituency","ward","category","skills","availability","hoursPerWeek","motivation","referenceName","referenceOrganization","referencePhone","referenceEmail","emergencyName","emergencyPhone"];
    if (!required.every((field) => clean(body[field]) !== null && clean(body[field]) !== "")) return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    const dateOfBirth = parseDateOfBirth(body.dateOfBirth);
    const hoursPerWeek = Number(body.hoursPerWeek);
    if (!dateOfBirth) return NextResponse.json({ error: "Please enter a valid date of birth in DD/MM/YYYY format." }, { status: 400 });
    if (!Number.isInteger(hoursPerWeek) || hoursPerWeek < 1 || hoursPerWeek > 40) return NextResponse.json({ error: "Please select a valid number of volunteer hours per week." }, { status: 400 });
    if (body.consent !== true) return NextResponse.json({ error: "Consent is required." }, { status: 400 });
    const elsewhere = body.volunteeringElsewhere === true;
    const convicted = body.criminalConviction === true;
    const disability = body.disability === true;
    if (elsewhere && !clean(body.otherVolunteeringDetails)) return NextResponse.json({ error: "Please describe your current volunteering elsewhere." }, { status: 400 });
    if (convicted && !clean(body.criminalOffenceDetails)) return NextResponse.json({ error: "Please provide details of the disclosed conviction." }, { status: 400 });
    if (disability && (!body.disabilityCertificate || !body.disabilityCertificate.startsWith("data:"))) return NextResponse.json({ error: "Please upload your disability certificate." }, { status: 400 });
    if (body.profilePicture && (typeof body.profilePicture !== "string" || !body.profilePicture.startsWith("data:image/") || body.profilePicture.length > 1200000)) return NextResponse.json({ error: "Please upload a smaller profile picture (maximum 1 MB)." }, { status: 400 });
    if (body.disabilityCertificate && (typeof body.disabilityCertificate !== "string" || body.disabilityCertificate.length > 2500000)) return NextResponse.json({ error: "Please upload a smaller disability certificate (maximum 2 MB)." }, { status: 400 });

    await ensureVolunteerTable();
    const result = await pool.query(
      `INSERT INTO volunteer_applications
       (full_name, age, date_of_birth, nationality, gender, faith, email, phone, province, district, constituency, ward, location, current_occupation, education, category, skills, availability, hours_per_week, motivation, volunteering_elsewhere, other_volunteering_details, past_volunteer_positions, reference_name, reference_organization, reference_phone, reference_email, criminal_conviction, criminal_offence_details, disability, disability_certificate, disability_certificate_name, profile_picture, emergency_name, emergency_phone, consent)
       VALUES ($1,EXTRACT(YEAR FROM AGE(CURRENT_DATE, $2::date))::integer,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36)
       RETURNING id, created_at`,
      [dateOfBirth, clean(body.nationality), clean(body.gender), clean(body.faith), clean(body.email)?.toLowerCase(), clean(body.phone), clean(body.province), clean(body.district), clean(body.constituency), clean(body.ward), clean(body.location) || [clean(body.district), clean(body.province)].filter(Boolean).join(", "), clean(body.currentOccupation), clean(body.education), clean(body.category), clean(body.skills), clean(body.availability), hoursPerWeek, clean(body.motivation), elsewhere, clean(body.otherVolunteeringDetails), clean(body.pastVolunteerPositions), clean(body.referenceName), clean(body.referenceOrganization), clean(body.referencePhone), clean(body.referenceEmail)?.toLowerCase(), convicted, clean(body.criminalOffenceDetails), disability, disability ? body.disabilityCertificate : null, disability ? clean(body.disabilityCertificateName) : null, null, clean(body.emergencyName), clean(body.emergencyPhone), true]
    );

    let profilePicture = null;
    try {
      profilePicture = await storeProfilePicture(body.profilePicture, result.rows[0].id);
      if (profilePicture) await pool.query("UPDATE volunteer_applications SET profile_picture = $1 WHERE id = $2", [profilePicture, result.rows[0].id]);
    } catch (photoError) {
      await pool.query("DELETE FROM volunteer_applications WHERE id = $1", [result.rows[0].id]);
      throw photoError;
    }

    return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error("Volunteer application error:", error);
    const detail = process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined;
    return NextResponse.json({ error: "We could not submit your application. Please try again.", ...(detail ? { detail } : {}) }, { status: 500 });
  }
}
