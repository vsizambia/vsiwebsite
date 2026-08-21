import { NextResponse } from "next/server";
import { ensureVolunteerTable, pool } from "../../../../lib/db";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

const allowedStatuses = ["pending", "approved", "rejected", "inactive"];
const rejectionReasons = ["age_eligibility", "recruitment_closed", "incomplete_application", "role_fit", "safeguarding", "capacity", "other"];
const fields = ["full_name","age","nationality","email","phone","province","district","constituency","ward","location","current_occupation","education","category","skills","availability","motivation","volunteering_elsewhere","other_volunteering_details","past_volunteer_positions","reference_name","reference_organization","reference_phone","reference_email","criminal_conviction","criminal_offence_details","profile_picture","emergency_name","emergency_phone","directorate","programme","project","activity","line_manager_name","line_manager_title","line_manager_phone","line_manager_email"];
function unauthorized(){ return NextResponse.json({ error:"Admin authentication required." },{status:401}); }
function value(body,key){ return body[key] === undefined ? null : body[key]; }

export async function GET(request){
  if(!isAdminAuthenticated(request)) return unauthorized();
  try{
    await ensureVolunteerTable();
    const result=await pool.query(`SELECT ${fields.join(", ")}, id, status, rejection_reason, rejection_note, reviewed_at, created_at, updated_at FROM volunteer_applications ORDER BY created_at DESC`);
    return NextResponse.json({applications:result.rows});
  }catch(error){ console.error("Volunteer admin error:",error); return NextResponse.json({error:"Unable to load volunteer applications."},{status:500}); }
}

export async function PATCH(request){
  if(!isAdminAuthenticated(request)) return unauthorized();
  try{
    const body=await request.json(); const {id,status,rejectionReason,rejectionNote}=body;
    if(!id || !allowedStatuses.includes(status)) return NextResponse.json({error:"Invalid volunteer status update."},{status:400});
    if(status==="rejected" && !rejectionReasons.includes(rejectionReason)) return NextResponse.json({error:"Please select a reason for rejection."},{status:400});
    if(status==="approved" && !body.directorate) return NextResponse.json({error:"Please assign the approved volunteer to a VSI directorate."},{status:400});
    await ensureVolunteerTable();
    const result=await pool.query(`UPDATE volunteer_applications SET status=$1, rejection_reason=CASE WHEN $1='rejected' THEN $2 ELSE NULL END, rejection_note=CASE WHEN $1='rejected' THEN NULLIF($3,'') ELSE NULL END, reviewed_at=CASE WHEN $1 IN ('approved','rejected','inactive') THEN NOW() ELSE reviewed_at END, directorate=CASE WHEN $1='approved' THEN NULLIF($5,'') ELSE directorate END, programme=CASE WHEN $1='approved' THEN NULLIF($6,'') ELSE programme END, project=CASE WHEN $1='approved' THEN NULLIF($7,'') ELSE project END, activity=CASE WHEN $1='approved' THEN NULLIF($8,'') ELSE activity END, line_manager_name=CASE WHEN $1='approved' THEN NULLIF($9,'') ELSE line_manager_name END, line_manager_title=CASE WHEN $1='approved' THEN NULLIF($10,'') ELSE line_manager_title END, line_manager_phone=CASE WHEN $1='approved' THEN NULLIF($11,'') ELSE line_manager_phone END, line_manager_email=CASE WHEN $1='approved' THEN NULLIF($12,'') ELSE line_manager_email END, updated_at=NOW() WHERE id=$4 RETURNING *`,[status,rejectionReason||null,typeof rejectionNote==="string"?rejectionNote.trim():"",id,body.directorate,body.programme,body.project,body.activity,body.lineManagerName,body.lineManagerTitle,body.lineManagerPhone,body.lineManagerEmail]);
    if(!result.rowCount) return NextResponse.json({error:"Volunteer application not found."},{status:404});
    return NextResponse.json({ok:true,volunteer:result.rows[0]});
  }catch(error){ console.error("Volunteer status error:",error); return NextResponse.json({error:"Unable to update volunteer status."},{status:500}); }
}

export async function PUT(request){
  if(!isAdminAuthenticated(request)) return unauthorized();
  try{
    const body=await request.json(); const id=body.id;
    if(!id) return NextResponse.json({error:"Volunteer record ID is required."},{status:400});
    await ensureVolunteerTable();
    const updates=fields.filter((field)=>body[field]!==undefined);
    if(!updates.length) return NextResponse.json({error:"No changes supplied."},{status:400});
    if(body.age!==undefined && body.age!==null && (!Number.isInteger(Number(body.age)) || Number(body.age)<1 || Number(body.age)>120)) return NextResponse.json({error:"Please enter a valid age."},{status:400});
    if(body.profile_picture && (typeof body.profile_picture!=="string" || !body.profile_picture.startsWith("data:image/") || body.profile_picture.length>1200000)) return NextResponse.json({error:"Profile picture must be a supported image under 1 MB."},{status:400});
    const setClause=updates.map((field,index)=>`${field}=$${index+1}`).join(", ");
    const values=updates.map((field)=>body[field]); values.push(id);
    const result=await pool.query(`UPDATE volunteer_applications SET ${setClause}, updated_at=NOW() WHERE id=$${values.length} RETURNING *`,values);
    if(!result.rowCount) return NextResponse.json({error:"Volunteer record not found."},{status:404});
    return NextResponse.json({ok:true,volunteer:result.rows[0]});
  }catch(error){ console.error("Volunteer edit error:",error); return NextResponse.json({error:"Unable to edit volunteer record."},{status:500}); }
}

export async function DELETE(request){
  if(!isAdminAuthenticated(request)) return unauthorized();
  try{
    const body=await request.json(); if(!body.id) return NextResponse.json({error:"Volunteer record ID is required."},{status:400});
    await ensureVolunteerTable();
    const result=await pool.query("DELETE FROM volunteer_applications WHERE id=$1 RETURNING id",[body.id]);
    if(!result.rowCount) return NextResponse.json({error:"Volunteer record not found."},{status:404});
    return NextResponse.json({ok:true,id:result.rows[0].id});
  }catch(error){ console.error("Volunteer delete error:",error); return NextResponse.json({error:"Unable to delete volunteer record."},{status:500}); }
}
