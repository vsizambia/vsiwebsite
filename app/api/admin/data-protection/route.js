import {NextResponse} from "next/server";
import {ensureDataProtectionTables,pool} from "../../../../lib/db";
import {isAdminAuthenticated} from "../../../../lib/admin-auth";
const unauthorized=()=>NextResponse.json({error:"Admin authentication required."},{status:401});

async function retentionSummary(){
  const rules=(await pool.query("SELECT * FROM data_retention_rules WHERE active=TRUE ORDER BY label")).rows;
  const volunteer=(await pool.query("SELECT COUNT(*)::int total, COUNT(*) FILTER (WHERE created_at + INTERVAL '60 months' <= NOW())::int due FROM volunteer_applications")).rows[0];
  const activities=(await pool.query("SELECT COUNT(*)::int total, COUNT(*) FILTER (WHERE created_at + INTERVAL '84 months' <= NOW())::int due FROM volunteer_activity_register")).rows[0];
  const requests=(await pool.query("SELECT COUNT(*)::int total, COUNT(*) FILTER (WHERE received_at + INTERVAL '36 months' <= NOW())::int due FROM data_protection_requests")).rows[0];
  const incidents=(await pool.query("SELECT COUNT(*)::int total, COUNT(*) FILTER (WHERE reported_at + INTERVAL '84 months' <= NOW())::int due FROM data_protection_incidents")).rows[0];
  const counts={volunteer_application:volunteer,volunteer_profile_photo:volunteer,volunteer_activity:activities,professional_development:{total:0,due:0},event_registration:{total:0,due:0},data_subject_request:requests,data_protection_incident:incidents};
  return rules.map(rule=>({...rule,total:Number(counts[rule.record_type]?.total||0),due:Number(counts[rule.record_type]?.due||0)}));
}

export async function GET(request){
 if(!isAdminAuthenticated(request))return unauthorized();
 try{await ensureDataProtectionTables();
 const [requests,incidents,consents,retention,recentActions]=await Promise.all([
 pool.query("SELECT * FROM data_protection_requests ORDER BY received_at DESC LIMIT 100"),
 pool.query("SELECT * FROM data_protection_incidents ORDER BY reported_at DESC LIMIT 100"),
 pool.query("SELECT consent_type,COUNT(*) FILTER(WHERE granted) granted,COUNT(*) total FROM data_protection_consent_log GROUP BY consent_type ORDER BY consent_type"),
 retentionSummary(),
 pool.query("SELECT * FROM data_retention_actions ORDER BY performed_at DESC LIMIT 50")]);
 return NextResponse.json({requests:requests.rows,incidents:incidents.rows,consents:consents.rows,retention,recentActions:recentActions.rows});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to load compliance records."},{status:500});}
}

export async function PATCH(request){
 if(!isAdminAuthenticated(request))return unauthorized();
 try{await ensureDataProtectionTables();const b=await request.json();
 if(b.kind==="request"){const status=String(b.status||"").trim();if(!["received","in_progress","completed","closed"].includes(status))return NextResponse.json({error:"Invalid request status."},{status:400});const r=await pool.query("UPDATE data_protection_requests SET status=$1,completed_at=CASE WHEN $1 IN ('completed','closed') THEN COALESCE(completed_at,NOW()) ELSE NULL END WHERE id=$2 RETURNING *",[status,Number(b.id)]);return NextResponse.json({record:r.rows[0]});}
 if(b.kind==="incident"){const status=String(b.status||"").trim();if(!["open","contained","investigating","resolved"].includes(status))return NextResponse.json({error:"Invalid incident status."},{status:400});const r=await pool.query("UPDATE data_protection_incidents SET status=$1,resolved_at=CASE WHEN $1='resolved' THEN COALESCE(resolved_at,NOW()) ELSE NULL END WHERE id=$2 RETURNING *",[status,Number(b.id)]);return NextResponse.json({record:r.rows[0]});}
 if(b.kind==="retention_rule"){const months=Number(b.retentionMonths);const action=String(b.action||"");if(!Number.isInteger(months)||months<0||!["review","archive","anonymise","delete"].includes(action))return NextResponse.json({error:"Invalid retention rule."},{status:400});const r=await pool.query("UPDATE data_retention_rules SET retention_months=$1,action=$2,updated_at=NOW() WHERE id=$3 RETURNING *",[months,action,Number(b.id)]);return NextResponse.json({record:r.rows[0]});}
 return NextResponse.json({error:"Invalid update."},{status:400});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to update record."},{status:500});}
}

export async function POST(request){
 if(!isAdminAuthenticated(request))return unauthorized();
 try{await ensureDataProtectionTables();const b=await request.json();
 if(b.kind==="retention_action"){const action=String(b.action||"");const type=String(b.recordType||"");const id=Number(b.recordId);if(!type||!Number.isFinite(id)||!["retain","review","archive","anonymise","delete"].includes(action))return NextResponse.json({error:"Invalid retention action."},{status:400});const r=await pool.query("INSERT INTO data_retention_actions (record_type,record_id,action,reason,performed_by) VALUES ($1,$2,$3,$4,$5) RETURNING *",[type,id,action,String(b.reason||"").trim()||null,"admin"]);return NextResponse.json({action:r.rows[0]},{status:201});}
 const type=String(b.incidentType||"").trim(),summary=String(b.summary||"").trim();if(!type||!summary)return NextResponse.json({error:"Incident type and summary are required."},{status:400});const r=await pool.query("INSERT INTO data_protection_incidents (incident_type,summary,personal_data_affected,containment_action) VALUES ($1,$2,$3,$4) RETURNING *",[type,summary,b.personalDataAffected===true,String(b.containmentAction||"").trim()||null]);return NextResponse.json({incident:r.rows[0]},{status:201});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to record compliance action."},{status:500});}
}