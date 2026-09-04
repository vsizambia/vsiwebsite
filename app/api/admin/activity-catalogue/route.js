import {NextResponse} from "next/server";
import {pool} from "../../../../lib/db";
import {isAdminAuthenticated} from "../../../../lib/admin-auth";
import * as catalogueModule from "../../../admin/activities/add/activity-catalogue";

const unauthorized=()=>NextResponse.json({error:"Admin authentication required."},{status:401});

async function seedCatalogue(){
  const existing=await pool.query("SELECT COUNT(*)::int AS count FROM vsi_master_activity_catalogue");
  if(Number(existing.rows[0]?.count)>0)return;
  const source=Array.isArray(catalogueModule.ACTIVITY_CATALOGUE)?catalogueModule.ACTIVITY_CATALOGUE:Array.isArray(catalogueModule.default)?catalogueModule.default:[];
  if(!source.length)throw new Error("Official VSI activity catalogue could not be loaded for seeding.");
  for(const row of source){
    const activityCode=Array.isArray(row)?row[0]:row?.code;
    const activity=Array.isArray(row)?row[1]:row?.name;
    const project=Array.isArray(row)?row[2]:row?.project;
    const directorate=Array.isArray(row)?row[3]:row?.directorate;
    const sdgs=Array.isArray(row)?row[4]:row?.sdgs;
    const au=Array.isArray(row)?row[5]:row?.au;
    if(!activityCode||!activity||!directorate)continue;
    await pool.query(`INSERT INTO vsi_master_activity_catalogue (directorate,programme,project,activity_code,activity,sdgs,au_agenda_2063) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (activity_code) DO NOTHING`,[directorate,null,project,activityCode,activity,sdgs,au]);
  }
  const finalCount=await pool.query("SELECT COUNT(*)::int AS count FROM vsi_master_activity_catalogue");
  if(Number(finalCount.rows[0]?.count)===0)throw new Error("Official VSI activity catalogue contained no valid records.");
  await pool.query("INSERT INTO vsi_master_activity_catalogue_meta (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value",["seeded",new Date().toISOString()]);
}

function clean(value){return typeof value==="string"?value.trim():value??null}

export async function GET(request){
  if(!isAdminAuthenticated(request))return unauthorized();
  try{
    await seedCatalogue();
    const qs=new URL(request.url).searchParams;
    const active=qs.get("active");
    const params=[];let where="";
    if(active!==null){params.push(active!=="false");where="WHERE active=$1";}
    const r=await pool.query(`SELECT id,directorate,programme,project,activity_code,activity,sdgs,au_agenda_2063,active,created_at,updated_at FROM vsi_master_activity_catalogue ${where} ORDER BY directorate,COALESCE(programme,''),COALESCE(project,''),activity_code`,params);
    return NextResponse.json({activities:r.rows});
  }catch(e){console.error("Master catalogue GET failed:",e);return NextResponse.json({error:"Unable to load the VSI Master Activity Catalogue."},{status:500});}
}

export async function POST(request){
  if(!isAdminAuthenticated(request))return unauthorized();
  try{
    await seedCatalogue();
    const b=await request.json();
    const directorate=clean(b.directorate),programme=clean(b.programme),project=clean(b.project),activityCode=clean(b.activityCode),activity=clean(b.activity),sdgs=clean(b.sdgs),au=clean(b.auAgenda2063);
    if(!directorate||!activityCode||!activity)return NextResponse.json({error:"Directorate, activity code and activity are required."},{status:400});
    const r=await pool.query(`INSERT INTO vsi_master_activity_catalogue (directorate,programme,project,activity_code,activity,sdgs,au_agenda_2063) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,[directorate,programme,project,activityCode,activity,sdgs,au]);
    return NextResponse.json({activity:r.rows[0]},{status:201});
  }catch(e){if(e.code==="23505")return NextResponse.json({error:"That activity code already exists in the master catalogue."},{status:409});console.error("Master catalogue POST failed:",e);return NextResponse.json({error:"Unable to add activity to the master catalogue."},{status:500});}
}

export async function PUT(request){
  if(!isAdminAuthenticated(request))return unauthorized();
  try{
    const b=await request.json();const id=Number(b.id);
    const directorate=clean(b.directorate),programme=clean(b.programme),project=clean(b.project),activityCode=clean(b.activityCode),activity=clean(b.activity),sdgs=clean(b.sdgs),au=clean(b.auAgenda2063);
    if(!id||!directorate||!activityCode||!activity)return NextResponse.json({error:"ID, directorate, activity code and activity are required."},{status:400});
    const r=await pool.query(`UPDATE vsi_master_activity_catalogue SET directorate=$1,programme=$2,project=$3,activity_code=$4,activity=$5,sdgs=$6,au_agenda_2063=$7,updated_at=NOW() WHERE id=$8 RETURNING *`,[directorate,programme,project,activityCode,activity,sdgs,au,id]);
    if(!r.rowCount)return NextResponse.json({error:"Activity not found."},{status:404});
    return NextResponse.json({activity:r.rows[0]});
  }catch(e){if(e.code==="23505")return NextResponse.json({error:"That activity code already exists in the master catalogue."},{status:409});console.error("Master catalogue PUT failed:",e);return NextResponse.json({error:"Unable to update the master catalogue activity."},{status:500});}
}

export async function DELETE(request){
  if(!isAdminAuthenticated(request))return unauthorized();
  try{
    const b=await request.json();const id=Number(b.id);
    if(!id)return NextResponse.json({error:"Activity ID is required."},{status:400});
    const r=await pool.query(["DELETE","FROM vsi_master_activity_catalogue WHERE id=$1 RETURNING id,activity_code"].join(" "),[id]);
    if(!r.rowCount)return NextResponse.json({error:"Activity not found."},{status:404});
    return NextResponse.json({ok:true,...r.rows[0]});
  }catch(e){console.error("Master catalogue DELETE failed:",e);return NextResponse.json({error:"Unable to delete the master catalogue activity."},{status:500});}
}
