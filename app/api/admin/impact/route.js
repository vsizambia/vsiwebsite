import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

const unauthorized=()=>NextResponse.json({error:"Admin authentication required."},{status:401});
const PROGRAMME_KEYS=["ovc-support","clean-green-healthy","education-support","civic-voter","youth-policy","policy-contribution","community-health","youth-skills"];
const clean=(v,max=500)=>typeof v==="string"?v.trim().slice(0,max):"";
const intOrNull=v=>v===""||v===null||v===undefined?null:Number(v);
const validInt=v=>v===null||Number.isSafeInteger(v)&&v>=0;
const labels={activities:"Activities conducted",male:"Male reached",female:"Female reached",marketeers:"Marketeers reached",documents:"Policy & research outputs",institutions:"Institutions engaged"};

async function programmes(client){const r=await client.query("SELECT programme_key, number, title, category, description, metrics, updated_at FROM vsi_impact_programmes ORDER BY number");return r.rows}
async function recalculate(client){
 for(const key of PROGRAMME_KEYS){
  const r=await client.query("SELECT COUNT(*)::int AS n,COALESCE(SUM(male_reached),0)::int AS male,COALESCE(SUM(female_reached),0)::int AS female,COALESCE(SUM(marketeers_reached),0)::int AS marketeers,COALESCE(SUM(documents_contributed),0)::int AS documents,COUNT(DISTINCT NULLIF(LOWER(TRIM(institution_name)),''))::int AS institutions FROM vsi_impact_activities WHERE programme_key=$1",[key]);
  const x=r.rows[0];const map={
   "ovc-support":[["activities",x.n],["male",x.male],["female",x.female]],
   "clean-green-healthy":[["activities",x.n],["marketeers",x.marketeers]],
   "education-support":[["activities",x.n],["male",x.male],["female",x.female]],
   "civic-voter":[["activities",x.n],["male",x.male],["female",x.female]],
   "youth-policy":[["activities",x.n],["male",x.male],["female",x.female],["institutions",x.institutions]],
   "policy-contribution":[["activities",x.n],["documents",x.documents],["institutions",x.institutions]],
   "community-health":[["activities",x.n],["male",x.male],["female",x.female]],
   "youth-skills":[["activities",x.n],["male",x.male],["female",x.female]]
  };
  await client.query("UPDATE vsi_impact_programmes SET metrics=$1::jsonb,updated_at=NOW() WHERE programme_key=$2",[JSON.stringify(map[key].map(([key,value])=>({key,value,label:labels[key]}))),key]);
 }
}
export async function GET(request){
 if(!isAdminAuthenticated(request))return unauthorized();
 try{const[p,a]=await Promise.all([pool.query("SELECT programme_key,number,title,category,description,metrics,updated_at FROM vsi_impact_programmes ORDER BY number"),pool.query("SELECT id,programme_key,activity_name,activity_date,province,district,constituency,ward,institution_name,partner,male_reached,female_reached,male_marketeers_reached,female_marketeers_reached,marketeers_reached,documents_contributed,institutions_engaged,people_reached,items_donated,schools_supported,youth_participants,trees_planted,notes,catalogue_activity_code,created_at FROM vsi_impact_activities ORDER BY activity_date DESC,id DESC")]);return NextResponse.json({programmes:p.rows,activities:a.rows})}
 catch(error){console.error(error);return NextResponse.json({error:"Unable to load Impact register. Confirm both Impact migrations have been applied."},{status:500})}
}
export async function POST(request){
 if(!isAdminAuthenticated(request))return unauthorized();let b;try{b=await request.json()}catch{return NextResponse.json({error:"A valid JSON request is required."},{status:400})}
 const key=clean(b?.programme_key,60),name=clean(b?.activity_name,160),date=clean(b?.activity_date,20);
 const nums={male_reached:intOrNull(b?.male_reached),female_reached:intOrNull(b?.female_reached),male_marketeers_reached:intOrNull(b?.male_marketeers_reached),female_marketeers_reached:intOrNull(b?.female_marketeers_reached),marketeers_reached:intOrNull(b?.marketeers_reached),documents_contributed:intOrNull(b?.documents_contributed),institutions_engaged:intOrNull(b?.institutions_engaged),people_reached:intOrNull(b?.people_reached),items_donated:intOrNull(b?.items_donated),schools_supported:intOrNull(b?.schools_supported),youth_participants:intOrNull(b?.youth_participants),trees_planted:intOrNull(b?.trees_planted)};
 const catalogueId=b?.catalogue_activity_id?Number(b.catalogue_activity_id):null;
 if(catalogueId!==null&&(!Number.isSafeInteger(catalogueId)||catalogueId<1))return NextResponse.json({error:"Select a valid activity from the VSI Master Activity Catalogue."},{status:400});
 if(!PROGRAMME_KEYS.includes(key)||!name||!/^\d{4}-\d{2}-\d{2}$/.test(date)||Object.values(nums).some(v=>!validInt(v)))return NextResponse.json({error:"Select a programme, enter an activity name and date, and use whole numbers zero or higher for figures."},{status:400});
 const client=await pool.connect();try{await client.query("BEGIN");let catalogueCode=null;if(catalogueId!==null){const c=await client.query("SELECT activity_code FROM vsi_master_activity_catalogue WHERE id=$1 AND active=true",[catalogueId]);if(!c.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"The selected catalogue activity is no longer active."},{status:400});}catalogueCode=c.rows[0].activity_code;}const r=await client.query("INSERT INTO vsi_impact_activities (programme_key,activity_name,activity_date,province,district,constituency,ward,institution_name,partner,male_reached,female_reached,male_marketeers_reached,female_marketeers_reached,marketeers_reached,documents_contributed,institutions_engaged,people_reached,items_donated,schools_supported,youth_participants,trees_planted,notes,catalogue_activity_code) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23) RETURNING *",[key,name,date,clean(b.province,100),clean(b.district,100),clean(b.constituency,120),clean(b.ward,120),clean(b.institution_name,250),clean(b.partner,200),nums.male_reached,nums.female_reached,nums.male_marketeers_reached,nums.female_marketeers_reached,nums.marketeers_reached,nums.documents_contributed,nums.institutions_engaged,nums.people_reached,nums.items_donated,nums.schools_supported,nums.youth_participants,nums.trees_planted,clean(b.notes,1000),catalogueCode]);await recalculate(client);await client.query("COMMIT");return NextResponse.json({ok:true,activity:r.rows[0],programmes:await programmes(client)},{status:201})}catch(error){await client.query("ROLLBACK");console.error(error);return NextResponse.json({error:"Unable to save the Impact activity."},{status:500})}finally{client.release()}
}
export async function DELETE(request){
 if(!isAdminAuthenticated(request))return unauthorized();let b;try{b=await request.json()}catch{return NextResponse.json({error:"A valid JSON request is required."},{status:400})}const id=Number(b?.id);if(!Number.isSafeInteger(id)||id<1)return NextResponse.json({error:"A valid activity is required."},{status:400});
 const client=await pool.connect();try{await client.query("BEGIN");const r=await client.query("DELETE FROM vsi_impact_activities WHERE id=$1 RETURNING id",[id]);if(!r.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"Activity not found."},{status:404})}await recalculate(client);await client.query("COMMIT");return NextResponse.json({ok:true,programmes:await programmes(client)})}catch(error){await client.query("ROLLBACK");console.error(error);return NextResponse.json({error:"Unable to delete the Impact activity."},{status:500})}finally{client.release()}
}
export async function PUT(request){
 if(!isAdminAuthenticated(request))return unauthorized();let b;try{b=await request.json()}catch{return NextResponse.json({error:"A valid JSON request is required."},{status:400})}
 const id=Number(b?.id),key=clean(b?.programme_key,60),name=clean(b?.activity_name,160),date=clean(b?.activity_date,20);
 const nums={male_reached:intOrNull(b?.male_reached),female_reached:intOrNull(b?.female_reached),male_marketeers_reached:intOrNull(b?.male_marketeers_reached),female_marketeers_reached:intOrNull(b?.female_marketeers_reached),marketeers_reached:intOrNull(b?.marketeers_reached),documents_contributed:intOrNull(b?.documents_contributed),institutions_engaged:intOrNull(b?.institutions_engaged),people_reached:intOrNull(b?.people_reached),items_donated:intOrNull(b?.items_donated),schools_supported:intOrNull(b?.schools_supported),youth_participants:intOrNull(b?.youth_participants),trees_planted:intOrNull(b?.trees_planted)};
 const catalogueId=b?.catalogue_activity_id?Number(b.catalogue_activity_id):null;
 if(!Number.isSafeInteger(id)||id<1||catalogueId!==null&&(!Number.isSafeInteger(catalogueId)||catalogueId<1))return NextResponse.json({error:"A valid activity and catalogue selection are required."},{status:400});
 if(!PROGRAMME_KEYS.includes(key)||!name||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)||Object.values(nums).some(v=>!validInt(v)))return NextResponse.json({error:"Select a programme, enter an activity name and date, and use whole numbers zero or higher for figures."},{status:400});
 const client=await pool.connect();try{await client.query("BEGIN");let catalogueCode=null;if(catalogueId!==null){const c=await client.query("SELECT activity_code FROM vsi_master_activity_catalogue WHERE id=$1 AND active=true",[catalogueId]);if(!c.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"The selected catalogue activity is no longer active."},{status:400})}catalogueCode=c.rows[0].activity_code;}const r=await client.query("UPDATE vsi_impact_activities SET programme_key=$1,activity_name=$2,activity_date=$3,province=$4,district=$5,constituency=$6,ward=$7,institution_name=$8,partner=$9,male_reached=$10,female_reached=$11,male_marketeers_reached=$12,female_marketeers_reached=$13,marketeers_reached=$14,documents_contributed=$15,institutions_engaged=$16,people_reached=$17,items_donated=$18,schools_supported=$19,youth_participants=$20,trees_planted=$21,notes=$22,catalogue_activity_code=$23,updated_at=NOW() WHERE id=$24 RETURNING *",[key,name,date,clean(b.province,100),clean(b.district,100),clean(b.constituency,120),clean(b.ward,120),clean(b.institution_name,250),clean(b.partner,200),nums.male_reached,nums.female_reached,nums.male_marketeers_reached,nums.female_marketeers_reached,nums.marketeers_reached,nums.documents_contributed,nums.institutions_engaged,nums.people_reached,nums.items_donated,nums.schools_supported,nums.youth_participants,nums.trees_planted,clean(b.notes,1000),catalogueCode,id]);if(!r.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"Activity not found."},{status:404})}await recalculate(client);await client.query("COMMIT");return NextResponse.json({ok:true,activity:r.rows[0],programmes:await programmes(client)})}catch(error){await client.query("ROLLBACK");console.error(error);return NextResponse.json({error:"Unable to update the Impact activity."},{status:500})}finally{client.release()}
}
