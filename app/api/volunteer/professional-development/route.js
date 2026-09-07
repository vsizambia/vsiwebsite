import {NextResponse} from "next/server";
import {ensureVolunteerTable,pool} from "../../../../../lib/db";

async function ensureTable(){
 await ensureVolunteerTable();
 await pool.query(`CREATE TABLE IF NOT EXISTS volunteer_professional_development (id BIGSERIAL PRIMARY KEY,volunteer_id BIGINT NOT NULL REFERENCES volunteer_applications(id) ON DELETE CASCADE,programme_name TEXT NOT NULL,development_date DATE NOT NULL,provider TEXT,hours NUMERIC(6,2) NOT NULL CHECK(hours>=0 AND hours<=24),status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK(status IN ('COMPLETED','IN_PROGRESS','PLANNED')),notes TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
 await pool.query(`ALTER TABLE volunteer_professional_development ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'APPROVED'`);
 await pool.query(`ALTER TABLE volunteer_professional_development ADD COLUMN IF NOT EXISTS review_comment TEXT`);
 await pool.query(`ALTER TABLE volunteer_professional_development ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'ADMIN'`);
 await pool.query(`ALTER TABLE volunteer_professional_development ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ`);
 await pool.query(`ALTER TABLE volunteer_professional_development ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`);
 await pool.query(`ALTER TABLE volunteer_professional_development ADD COLUMN IF NOT EXISTS reviewed_by TEXT`);
}

export async function POST(request){
 try{
  const b=await request.json();
  const volunteerId=String(b.volunteer_id||b.volunteerId||"").trim();
  const email=String(b.email||"").trim().toLowerCase();
  const programmeName=String(b.programme_name||"").trim();
  const developmentDate=String(b.development_date||"").trim();
  const provider=String(b.provider||"").trim();
  const hours=Number(b.hours);
  const notes=String(b.notes||"").trim();
  if(!volunteerId||!email||!programmeName||!developmentDate)return NextResponse.json({error:"VSI ID, email, programme/training and date are required."},{status:400});
  if(!/^\d{4}-\d{2}-\d{2}$/.test(developmentDate)||Number.isNaN(new Date(`${developmentDate}T00:00:00Z`).getTime()))return NextResponse.json({error:"Please enter a valid date."},{status:400});
  if(!Number.isFinite(hours)||hours<=0||hours>24)return NextResponse.json({error:"Development hours must be greater than 0 and no more than 24."},{status:400});
  await ensureTable();
  const v=await pool.query(`SELECT id,full_name,email,status FROM volunteer_applications WHERE UPPER(TRIM(volunteer_id))=UPPER(TRIM($1)) AND LOWER(TRIM(email))=LOWER(TRIM($2)) LIMIT 1`,[volunteerId,email]);
  if(!v.rowCount)return NextResponse.json({error:"We could not match that VSI ID and email to a volunteer record."},{status:404});
  if(String(v.rows[0].status).toLowerCase()!=="approved")return NextResponse.json({error:"Only approved VSI volunteers can submit professional development records."},{status:403});
  const duplicate=await pool.query(`SELECT id FROM volunteer_professional_development WHERE volunteer_id=$1 AND development_date=$2 AND LOWER(TRIM(programme_name))=LOWER(TRIM($3)) AND hours=$4 LIMIT 1`,[v.rows[0].id,developmentDate,programmeName,hours]);
  if(duplicate.rowCount)return NextResponse.json({error:"A matching professional development record has already been submitted."},{status:409});
  const r=await pool.query(`INSERT INTO volunteer_professional_development (volunteer_id,programme_name,development_date,provider,hours,status,notes,review_status,source,submitted_at) VALUES ($1,$2,$3,$4,$5,'COMPLETED',$6,'PENDING','VOLUNTEER',NOW()) RETURNING id`,[v.rows[0].id,programmeName,developmentDate,provider||null,hours,notes||null]);
  return NextResponse.json({ok:true,id:r.rows[0].id,message:"Your professional development record has been submitted for review."});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to submit professional development record."},{status:500});}
}
