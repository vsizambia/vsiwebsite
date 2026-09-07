import {NextResponse} from "next/server";
import {ensureVolunteerTable,pool} from "../../../../../lib/db";
import {isAdminAuthenticated} from "../../../../../lib/admin-auth";

const unauthorized=()=>NextResponse.json({error:"Admin authentication required."},{status:401});
const allowedStatuses=["COMPLETED","IN_PROGRESS","PLANNED"];
const allowedReviewStatuses=["PENDING","APPROVED","REJECTED"];

async function ensureProfessionalDevelopmentTable(){
 await ensureVolunteerTable();
 await pool.query(`CREATE TABLE IF NOT EXISTS volunteer_professional_development (id BIGSERIAL PRIMARY KEY,volunteer_id BIGINT NOT NULL REFERENCES volunteer_applications(id) ON DELETE CASCADE,programme_name TEXT NOT NULL,development_date DATE NOT NULL,provider TEXT,hours NUMERIC(6,2) NOT NULL CHECK(hours>=0 AND hours<=24),status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK(status IN ('COMPLETED','IN_PROGRESS','PLANNED')),notes TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
 await pool.query(`ALTER TABLE volunteer_professional_development ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'APPROVED'`);
 await pool.query(`ALTER TABLE volunteer_professional_development ADD COLUMN IF NOT EXISTS review_comment TEXT`);
 await pool.query(`ALTER TABLE volunteer_professional_development ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'ADMIN'`);
 await pool.query(`ALTER TABLE volunteer_professional_development ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ`);
 await pool.query(`ALTER TABLE volunteer_professional_development ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`);
 await pool.query(`ALTER TABLE volunteer_professional_development ADD COLUMN IF NOT EXISTS reviewed_by TEXT`);
 await pool.query(`CREATE INDEX IF NOT EXISTS volunteer_professional_development_volunteer_date_idx ON volunteer_professional_development(volunteer_id,development_date DESC)`);
 await pool.query(`CREATE INDEX IF NOT EXISTS volunteer_professional_development_review_idx ON volunteer_professional_development(review_status,development_date DESC)`);
}

async function recordsFor(volunteerId){
 return (await pool.query(`SELECT id,volunteer_id,programme_name,TO_CHAR(development_date,'DD/MM/YYYY') development_date,provider,hours,status,notes,review_status,review_comment,source,created_at,submitted_at,reviewed_at,reviewed_by FROM volunteer_professional_development WHERE volunteer_id=$1 ORDER BY development_date DESC,id DESC`,[volunteerId])).rows;
}

export async function GET(request){
 if(!isAdminAuthenticated(request))return unauthorized();
 try{const volunteerId=Number(new URL(request.url).searchParams.get("volunteerId"));if(!Number.isInteger(volunteerId)||volunteerId<1)return NextResponse.json({error:"A valid volunteer is required."},{status:400});await ensureProfessionalDevelopmentTable();return NextResponse.json({records:await recordsFor(volunteerId)});}catch(e){console.error(e);return NextResponse.json({error:"Unable to load professional development records."},{status:500});}
}

export async function POST(request){
 if(!isAdminAuthenticated(request))return unauthorized();
 try{const b=await request.json(),volunteerId=Number(b.volunteerId),hours=Number(b.hours),programmeName=typeof b.programme_name==="string"?b.programme_name.trim():"",developmentDate=typeof b.development_date==="string"?b.development_date.trim():"",provider=typeof b.provider==="string"?b.provider.trim():"",notes=typeof b.notes==="string"?b.notes.trim():"",status=typeof b.status==="string"?b.status:"";
 if(!Number.isInteger(volunteerId)||volunteerId<1)return NextResponse.json({error:"A valid volunteer is required."},{status:400});
 if(!programmeName||!developmentDate)return NextResponse.json({error:"Programme and date are required."},{status:400});
 if(!/^\d{4}-\d{2}-\d{2}$/.test(developmentDate)||Number.isNaN(new Date(`${developmentDate}T00:00:00Z`).getTime()))return NextResponse.json({error:"Please enter a valid date."},{status:400});
 if(!Number.isFinite(hours)||hours<0||hours>24)return NextResponse.json({error:"Development hours must be between 0 and 24."},{status:400});
 if(!allowedStatuses.includes(status))return NextResponse.json({error:"Please select a valid development status."},{status:400});
 await ensureProfessionalDevelopmentTable();const v=await pool.query("SELECT id FROM volunteer_applications WHERE id=$1",[volunteerId]);if(!v.rowCount)return NextResponse.json({error:"Volunteer record not found."},{status:404});
 await pool.query(`INSERT INTO volunteer_professional_development (volunteer_id,programme_name,development_date,provider,hours,status,notes,review_status,source,reviewed_at) VALUES ($1,$2,$3,$4,$5,$6,$7,'APPROVED','ADMIN',NOW())`,[volunteerId,programmeName,developmentDate,provider||null,hours,status,notes||null]);return NextResponse.json({ok:true,records:await recordsFor(volunteerId)});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to save professional development record."},{status:500});}
}

export async function PUT(request){
 if(!isAdminAuthenticated(request))return unauthorized();
 try{const b=await request.json(),id=Number(b.id),reviewStatus=typeof b.review_status==="string"?b.review_status.toUpperCase():"",reviewComment=typeof b.review_comment==="string"?b.review_comment.trim():"",reviewedBy=typeof b.reviewed_by==="string"?b.reviewed_by.trim():"ADMIN";
 if(!Number.isInteger(id)||id<1)return NextResponse.json({error:"A valid record is required."},{status:400});
 if(!allowedReviewStatuses.includes(reviewStatus))return NextResponse.json({error:"Please select a valid review status."},{status:400});
 if(reviewStatus==="REJECTED"&&!reviewComment)return NextResponse.json({error:"A rejection comment is required."},{status:400});
 await ensureProfessionalDevelopmentTable();
 const r=await pool.query(`UPDATE volunteer_professional_development SET review_status=$1,review_comment=$2,reviewed_at=NOW(),reviewed_by=$3,updated_at=NOW() WHERE id=$4 RETURNING volunteer_id`,[reviewStatus,reviewComment||null,reviewedBy||"ADMIN",id]);
 if(!r.rowCount)return NextResponse.json({error:"Professional development record not found."},{status:404});
 return NextResponse.json({ok:true,records:await recordsFor(Number(r.rows[0].volunteer_id))});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to review professional development record."},{status:500});}
}

export async function DELETE(request){
 if(!isAdminAuthenticated(request))return unauthorized();
 try{const b=await request.json(),id=Number(b.id),volunteerId=Number(b.volunteerId);if(!Number.isInteger(id)||id<1||!Number.isInteger(volunteerId)||volunteerId<1)return NextResponse.json({error:"A valid record is required."},{status:400});await ensureProfessionalDevelopmentTable();const r=await pool.query("DELETE FROM volunteer_professional_development WHERE id=$1 AND volunteer_id=$2 RETURNING id",[id,volunteerId]);if(!r.rowCount)return NextResponse.json({error:"Professional development record not found."},{status:404});return NextResponse.json({ok:true,records:await recordsFor(volunteerId)});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to remove professional development record."},{status:500});}
}
