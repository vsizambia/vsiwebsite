import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { publicPool } from "../../../../lib/db";
import { ECZ_2026_LOCATION_HIERARCHY } from "../../../data/ecz-2026-location-hierarchy";
export const dynamic = "force-dynamic";
const clean = value => typeof value === "string" ? value.trim() : "";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const policyVersion = "2026-11";
const validRows = (rows,max) => Array.isArray(rows) && rows.length > 0 && rows.length <= max;
export async function POST(request) {
  let client;
  try {
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 60000) return NextResponse.json({ error: "Application is too large. Please shorten some descriptions and try again." }, { status: 413 });
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid application details." }, { status: 400 });
    const opportunityId = Number(body.opportunityId);
    const fullName = clean(body.fullName), email = clean(body.email).toLowerCase();
    const phone = clean(body.phone), motivation = clean(body.motivation);
    if (!Number.isSafeInteger(opportunityId) || opportunityId < 1 || !fullName || fullName.length > 160 ||
        !emailPattern.test(email) || email.length > 254 || !phone || phone.length > 40 ||
        !motivation || motivation.length > 5000 || body.consent !== true ||
        clean(body.currentOccupation).length > 200 || clean(body.availability).length > 300 ||
        clean(body.residentialAddress).length > 250) {
      return NextResponse.json({ error: "Complete the required fields and accept the privacy notice." }, { status: 400 });
    }
    const province = ECZ_2026_LOCATION_HIERARCHY.find(p => p.name === clean(body.province));
    const district = province?.districts.find(d => d.name === clean(body.district));
    const constituency = district?.constituencies.find(c => c.name === clean(body.constituency));
    const ward = constituency?.wards.find(w => w.name === clean(body.ward));
    if (!province || !district || !constituency || !ward) return NextResponse.json({ error: "Select a valid province, district, constituency and ward from the location lists." }, { status: 400 });
    const education = Array.isArray(body.educationEntries) ? body.educationEntries : [];
    const experience = Array.isArray(body.experienceEntries) ? body.experienceEntries : [];
    const references = Array.isArray(body.references) ? body.references : [];
    const skills = Array.isArray(body.skills) ? body.skills.map(clean).filter(Boolean) : [];
    const interests = Array.isArray(body.interests) ? body.interests.map(clean).filter(Boolean) : [];
    if (!validRows(education,15) || education.some(x => !clean(x?.institution) || !clean(x?.qualification) || !/^\d{4}$/.test(clean(x?.yearStarted)) || !(clean(x?.yearCompleted)==="In progress" || /^\d{4}$/.test(clean(x?.yearCompleted))))) return NextResponse.json({ error: "Add at least one complete education record, including institution, qualification and study years." }, { status: 400 });
    if (education.some(x => x.yearCompleted!=="In progress" && Number(x.yearCompleted)<Number(x.yearStarted))) return NextResponse.json({ error: "An education completion year cannot be earlier than its start year." }, { status: 400 });
    if (!validRows(references,10) || references.some(x => !clean(x?.name) || !clean(x?.relationship) || !clean(x?.phone) || clean(x.name).length>160 || clean(x.phone).length>40 || clean(x.email).length>254)) return NextResponse.json({ error: "Provide at least one reference with a name, relationship and phone number." }, { status: 400 });
    if (!skills.length || skills.length>30 || skills.some(x=>x.length>120) || !interests.length || interests.length>30 || interests.some(x=>x.length>160)) return NextResponse.json({ error: "Please add at least one skill and one area of interest." }, { status: 400 });
    if (experience.length>20 || experience.some(x=>[x.organisation,x.position,x.responsibilities].some(v=>typeof v==="string"&&v.length>2500))) return NextResponse.json({ error: "One or more experience entries are too long." }, { status: 400 });
    const portfolioUrl=clean(body.portfolioUrl);
    if (portfolioUrl) { try { const parsed=new URL(portfolioUrl); if(parsed.protocol!=="https:"&&parsed.protocol!=="http:") throw new Error(); } catch { return NextResponse.json({error:"Enter a valid professional profile or portfolio link."},{status:400}); } }
    const details={
      location:{province:province.name,district:district.name,constituency:constituency.name,ward:ward.name,residentialAddress:clean(body.residentialAddress)},
      educationEntries:education.map(x=>({institution:clean(x.institution),qualification:clean(x.qualification),fieldOfStudy:clean(x.fieldOfStudy),yearStarted:clean(x.yearStarted),yearCompleted:clean(x.yearCompleted),grade:clean(x.grade)})),
      experienceEntries:experience.filter(x=>[x.organisation,x.position,x.yearStarted,x.yearEnded,x.responsibilities].some(v=>clean(v))).map(x=>({organisation:clean(x.organisation),position:clean(x.position),yearStarted:clean(x.yearStarted),yearEnded:clean(x.yearEnded),responsibilities:clean(x.responsibilities)})),
      skills,interests,
      references:references.map(x=>({name:clean(x.name),relationship:clean(x.relationship),organisation:clean(x.organisation),phone:clean(x.phone),email:clean(x.email).toLowerCase()})),
      availability:clean(body.availability)
    };
    const locationText=[province.name,district.name,constituency.name,ward.name,clean(body.residentialAddress)].filter(Boolean).join(" · ");
    const educationText=details.educationEntries.map(x=>[x.qualification,x.fieldOfStudy,x.institution,x.yearStarted+"–"+x.yearCompleted].filter(Boolean).join(", ")).join("; ").slice(0,500);
    const experienceText=details.experienceEntries.map(x=>[x.position,x.organisation,x.yearStarted&&(x.yearStarted+"–"+(x.yearEnded||"Present")),x.responsibilities].filter(Boolean).join(" — ")).join("\n").slice(0,5000);
    if (!publicPool) return NextResponse.json({error:"Public recruitment submission is not configured."},{status:503});
    client=await publicPool.connect();
    await client.query("BEGIN");
    const emailHash=crypto.createHash("sha256").update(email).digest("hex");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))",[emailHash]);
    await client.query("DELETE FROM vsi_recruitment_submission_limits WHERE created_at < NOW() - INTERVAL '1 day'");
    const recent=await client.query("SELECT COUNT(*)::int AS count FROM vsi_recruitment_submission_limits WHERE email_hash=$1 AND created_at > NOW() - INTERVAL '1 hour'",[emailHash]);
    if(recent.rows[0].count>=5){await client.query("ROLLBACK");return NextResponse.json({error:"Too many applications from this email address. Please try again later."},{status:429});}
    const opportunity=await client.query("SELECT id FROM vsi_recruitment_opportunities WHERE id=$1 AND status='published' AND (closing_date IS NULL OR closing_date >= CURRENT_DATE)",[opportunityId]);
    if(!opportunity.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"This opportunity is no longer accepting applications."},{status:404});}
    const reference="VSI-"+new Date().getFullYear()+"-"+crypto.randomBytes(4).toString("hex").toUpperCase();
    await client.query("INSERT INTO vsi_recruitment_submission_limits (email_hash) VALUES ($1)",[emailHash]);
    await client.query("INSERT INTO vsi_recruitment_applications (opportunity_id,reference_number,full_name,email,phone,location,education,current_occupation,experience,motivation,portfolio_url,consent_policy_version,application_details) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb)",
      [opportunityId,reference,fullName,email,phone,locationText,educationText,clean(body.currentOccupation),experienceText,motivation,portfolioUrl,policyVersion,JSON.stringify(details)]);
    await client.query("COMMIT");
    return NextResponse.json({ok:true,referenceNumber:reference},{status:201});
  } catch(error) {
    if(client) await client.query("ROLLBACK").catch(()=>{});
    console.error("Recruitment application:",error);
    return NextResponse.json({error:"We could not submit your application. Please try again."},{status:500});
  } finally { client?.release(); }
}
