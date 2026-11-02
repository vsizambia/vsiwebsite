import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";
export const dynamic = "force-dynamic";
const types = ["permanent_staff","contract_staff","consultant","project_staff","volunteer"];
const statuses = ["received","under_review","shortlisted","interview","selected","unsuccessful","withdrawn"];
const unauthorized = () => NextResponse.json({ error:"Admin authentication required." }, { status:401 });
const validId = value => Number.isSafeInteger(Number(value)) && Number(value) > 0;
export async function GET(request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  try {
    const [opportunities,applications,totals] = await Promise.all([
      pool.query("SELECT * FROM vsi_recruitment_opportunities ORDER BY created_at DESC"),
      pool.query(`SELECT DISTINCT ON (a.opportunity_id, lower(trim(a.email))) a.*,o.title AS opportunity_title,o.opportunity_type FROM vsi_recruitment_applications a JOIN vsi_recruitment_opportunities o ON o.id=a.opportunity_id WHERE a.email_verified_at IS NOT NULL ORDER BY a.opportunity_id, lower(trim(a.email)), a.created_at DESC, a.id DESC`),
      pool.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE status='received')::int received,COUNT(*) FILTER (WHERE status='shortlisted')::int shortlisted,COUNT(*) FILTER (WHERE status='interview')::int interviews FROM (SELECT DISTINCT ON (opportunity_id, lower(trim(email))) status FROM vsi_recruitment_applications WHERE email_verified_at IS NOT NULL ORDER BY opportunity_id, lower(trim(email)), created_at DESC, id DESC) applicants`)
    ]);
    return NextResponse.json({opportunities:opportunities.rows,applications:applications.rows,totals:totals.rows[0]}, {headers:{"Cache-Control":"no-store"}});
  } catch(error) { console.error("Admin recruitment:",error); return NextResponse.json({error:"Unable to load recruitment records. Confirm the recruitment database setup."},{status:500}); }
}
export async function POST(request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  try {
    const body=await request.json();
    if(!body||typeof body!=="object"||Array.isArray(body)) return NextResponse.json({error:"Invalid opportunity details."},{status:400});
    const title=typeof body.title==="string"?body.title.trim():"",type=body.opportunityType,description=typeof body.description==="string"?body.description.trim():"";
    if(!title||title.length>180||!types.includes(type)||!description||description.length>12000) return NextResponse.json({error:"Provide a title, valid opportunity category and description."},{status:400});
    const closingDate=body.closingDate||null;
    if(closingDate){const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(closingDate);const date=match?new Date(Date.UTC(Number(match[1]),Number(match[2])-1,Number(match[3]))):null;if(!date||date.getUTCFullYear()!==Number(match[1])||date.getUTCMonth()!==Number(match[2])-1||date.getUTCDate()!==Number(match[3])) return NextResponse.json({error:"Enter a valid closing date."},{status:400});}
    const result=await pool.query(`INSERT INTO vsi_recruitment_opportunities (title,opportunity_type,department,duty_station,description,requirements,closing_date,status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title,type,String(body.department||"").trim().slice(0,180),String(body.dutyStation||"").trim().slice(0,180),description,String(body.requirements||"").trim().slice(0,12000),closingDate,body.publish===true?"published":"draft"]);
    return NextResponse.json({ok:true,opportunity:result.rows[0]},{status:201});
  } catch(error) { console.error("Create recruitment opportunity:",error); return NextResponse.json({error:"Unable to save opportunity."},{status:500}); }
}
export async function PATCH(request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  try {
    const body=await request.json();
    if(!body||typeof body!=="object"||Array.isArray(body)) return NextResponse.json({error:"Invalid update."},{status:400});
    if(body.kind==="application"){
      if(!validId(body.id)||!statuses.includes(body.status)) return NextResponse.json({error:"Invalid application update."},{status:400});
      const result=await pool.query("UPDATE vsi_recruitment_applications SET status=$1,reviewer_notes=$2,reviewed_at=NOW(),updated_at=NOW() WHERE id=$3 AND email_verified_at IS NOT NULL RETURNING id,status",
        [body.status,typeof body.notes==="string"?body.notes.trim().slice(0,5000):null,Number(body.id)]);
      if(!result.rowCount)return NextResponse.json({error:"Verified application not found."},{status:404});
      return NextResponse.json({ok:true,application:result.rows[0]});
    }
    if(body.kind==="opportunity"){
      const allowed=["draft","published","closed","archived"];
      if(!validId(body.id)||!allowed.includes(body.status))return NextResponse.json({error:"Invalid opportunity update."},{status:400});
      const result=await pool.query("UPDATE vsi_recruitment_opportunities SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING id,status",[body.status,Number(body.id)]);
      if(!result.rowCount)return NextResponse.json({error:"Opportunity not found."},{status:404});
      return NextResponse.json({ok:true,opportunity:result.rows[0]});
    }
    return NextResponse.json({error:"Unknown recruitment update."},{status:400});
  } catch(error) { console.error("Update recruitment:",error); return NextResponse.json({error:"Unable to update recruitment record."},{status:500}); }
}
