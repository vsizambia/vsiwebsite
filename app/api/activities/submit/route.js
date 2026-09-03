import {NextResponse} from "next/server";
import crypto from "node:crypto";
import {ensureVolunteerTable,pool} from "../../../../lib/db";
import {ACTIVITY_CATALOGUE} from "../../../../app/admin/activities/add/activity-catalogue";

const hours=(s,e)=>{const[a,b]=String(s).split(":").map(Number),[c,d]=String(e).split(":").map(Number);let m=c*60+d-(a*60+b);if(m<0)m+=1440;return +(m/60).toFixed(2)};
const clean=v=>typeof v==="string"?v.trim():"";
const ACTIVITY_RATE_LIMIT=20;

function getClientIp(request){
 const realIp=request.headers.get("x-real-ip")?.trim();
 if(realIp)return realIp;
 const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
 return forwarded||"unknown";
}

function hashRateKey(ip){
 const secret=process.env.ADMIN_SESSION_SECRET||"vsi-activity-rate-limit";
 return crypto.createHmac("sha256",secret).update(ip).digest("hex");
}

async function allowActivitySubmission(request){
 const keyHash=hashRateKey(getClientIp(request));
 await pool.query(`CREATE TABLE IF NOT EXISTS volunteer_activity_rate_limits (id BIGSERIAL PRIMARY KEY, key_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
 await pool.query(`CREATE INDEX IF NOT EXISTS volunteer_activity_rate_limits_key_created_idx ON volunteer_activity_rate_limits(key_hash,created_at)`);
 const client=await pool.connect();
 try{
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(hashtext($1))",[keyHash]);
  await client.query("DELETE FROM volunteer_activity_rate_limits WHERE created_at < NOW() - INTERVAL '1 hour'");
  const count=await client.query("SELECT COUNT(*)::int AS count FROM volunteer_activity_rate_limits WHERE key_hash = $1 AND created_at >= NOW() - INTERVAL '1 hour'",[keyHash]);
  if(count.rows[0].count>=ACTIVITY_RATE_LIMIT){
   await client.query("ROLLBACK");
   return false;
  }
  await client.query("INSERT INTO volunteer_activity_rate_limits (key_hash) VALUES ($1)",[keyHash]);
  await client.query("COMMIT");
  return true;
 }catch(error){
  await client.query("ROLLBACK").catch(()=>{});
  throw error;
 }finally{
  client.release();
 }
}

const catalogueByCode=new Map(ACTIVITY_CATALOGUE.map(entry=>{const [code,name,project,directorate,sdgs,auAgenda]=Array.isArray(entry)?entry:[entry.code,entry.name,entry.project,entry.directorate,entry.sdgs,entry.auAgenda];return [String(code).trim().toUpperCase(),{code:String(code).trim(),name,project,directorate,sdgs,auAgenda}]}));

export async function GET(request){
 try{
  const q=new URL(request.url).searchParams.get("q")?.trim()||"";
  if(q.length<2)return NextResponse.json({volunteers:[]});
  await ensureVolunteerTable();
  const r=await pool.query(`SELECT id,full_name,volunteer_id,status FROM volunteer_applications WHERE LOWER(TRIM(status)) IN ('approved','pending') AND (full_name ILIKE $1 OR volunteer_id ILIKE $1) ORDER BY CASE WHEN LOWER(TRIM(status))='approved' THEN 0 ELSE 1 END, full_name LIMIT 10`,[`%${q}%`]);
  return NextResponse.json({volunteers:r.rows.map(v=>({id:v.id,name:v.full_name,volunteerId:v.volunteer_id,status:String(v.status||"").trim().toLowerCase()}))});
 }catch(e){console.error("Public volunteer lookup failed:",e);return NextResponse.json({error:"Unable to search volunteers right now."},{status:500});}
}

export async function POST(request){try{const b=await request.json();if(!b.volunteerId||!b.activityDate||!b.activityName||!b.activityCode||!b.startTime||!b.endTime||!b.description)return NextResponse.json({error:"Please complete all required activity fields."},{status:400});const h=hours(b.startTime,b.endTime);if(h<=0)return NextResponse.json({error:"Activity duration must be greater than zero."},{status:400});const catalogueActivity=catalogueByCode.get(clean(b.activityCode).toUpperCase());if(!catalogueActivity)return NextResponse.json({error:"Please select a valid VSI activity from the official activity catalogue."},{status:400});if(!await allowActivitySubmission(request))return NextResponse.json({error:"Too many activity submissions. Please try again later."},{status:429});await ensureVolunteerTable();const v=await pool.query("SELECT id,status,line_manager_name FROM volunteer_applications WHERE UPPER(TRIM(volunteer_id))=UPPER(TRIM($1)) LIMIT 1",[b.volunteerId]);if(!v.rowCount)return NextResponse.json({error:"We could not find that VSI volunteer. The name may be pending approval or not yet registered as a VSI Volunteer."},{status:404});if(String(v.rows[0].status||"").trim().toLowerCase()!=="approved")return NextResponse.json({error:"This volunteer is pending approval and cannot submit activities yet. Please wait until the VSI volunteer application is approved."},{status:403});const r=await pool.query(`INSERT INTO volunteer_activity_register (volunteer_id,activity_date,activity_name,activity_code,project,location,start_time,end_time,hours,directorate,sdgs,au_agenda,description,supervisor_name,facilitator,verified) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,false) RETURNING id,activity_date,activity_name,activity_code,hours,facilitator,verified`,[v.rows[0].id,b.activityDate,catalogueActivity.name,catalogueActivity.code,catalogueActivity.project,b.location||null,b.startTime,b.endTime,h,catalogueActivity.directorate,catalogueActivity.sdgs,catalogueActivity.auAgenda,b.description,v.rows[0].line_manager_name||null,b.facilitator?.trim()||null]);return NextResponse.json({activity:r.rows[0]},{status:201})}catch(e){console.error("Public activity submission failed:",e);return NextResponse.json({error:"Unable to submit activity right now. Please try again."},{status:500})}}
