import {NextResponse} from "next/server";
import {ensureVolunteerTable,pool} from "../../../../lib/db";

function hoursBetween(start,end){const [sh,sm]=String(start).split(":").map(Number);const [eh,em]=String(end).split(":").map(Number);let minutes=(eh*60+em)-(sh*60+sm);if(minutes<0)minutes+=1440;return Number((minutes/60).toFixed(2));}

export async function POST(request){
 try{
  const b=await request.json();
  if(!b.volunteerId||!b.activityDate||!b.activityName||!b.activityCode||!b.startTime||!b.endTime||!b.description)return NextResponse.json({error:"Please complete all required activity fields."},{status:400});
  const hours=hoursBetween(b.startTime,b.endTime);if(hours<=0)return NextResponse.json({error:"Activity duration must be greater than zero."},{status:400});
  await ensureVolunteerTable();
  const volunteer=await pool.query("SELECT id,status,volunteer_id,line_manager_name FROM volunteer_applications WHERE UPPER(TRIM(volunteer_id))=UPPER(TRIM($1)) LIMIT 1",[b.volunteerId]);
  if(!volunteer.rowCount)return NextResponse.json({error:"We could not find an approved VSI volunteer with that ID. Please check the ID and try again."},{status:404});
  if(volunteer.rows[0].status!=="approved")return NextResponse.json({error:"Only approved VSI volunteers can submit activities."},{status:403});
  const r=await pool.query(`INSERT INTO volunteer_activity_register (volunteer_id,activity_date,activity_name,activity_code,project,location,start_time,end_time,hours,directorate,sdgs,au_agenda,description,supervisor_name,verified) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,false) RETURNING id,activity_date,activity_name,activity_code,hours,verified`,[volunteer.rows[0].id,b.activityDate,b.activityName,b.activityCode,b.project||null,b.location||null,b.startTime,b.endTime,hours,b.directorate||null,b.sdgs||null,b.auAgenda||null,b.description,volunteer.rows[0].line_manager_name||null]);
  return NextResponse.json({activity:r.rows[0]},{status:201});
 }catch(e){console.error("Public activity submission failed:",e);return NextResponse.json({error:"Unable to submit activity right now. Please try again."},{status:500});}
}