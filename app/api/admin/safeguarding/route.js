import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";
import { readSafeguardingSession } from "../../../../lib/safeguarding-auth";

const unauthorized = () => NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
const statuses = new Set(["received","triage","action_required","referred","monitoring","closed"]);
const urgencies = new Set(["unassessed","urgent","high","standard"]);
const noteTypes = new Set(["triage","risk_assessment","protective_action","referral","follow_up","decision","general"]);
const clean = (v,max=5000) => typeof v === "string" ? v.trim().slice(0,max) : "";
async function resolveSafeguardingAccess(request, permission) {
  const tokenSession = readSafeguardingSession(request);
  if (!tokenSession) return { allowed: false, session: null };
  const result = await pool.query("SELECT username,display_name,role,active FROM safeguarding_users WHERE id=$1 LIMIT 1", [Number(tokenSession.sub)]);
  const user = result.rows[0];
  if (!user || !user.active) return { allowed: false, session: null };
  const allowed = user.role === "safeguarding_lead" ||
    (user.role === "case_officer" && ["read", "write_cases"].includes(permission)) ||
    (user.role === "read_only" && permission === "read");
  return { allowed, session: { ...tokenSession, username: user.username, name: user.display_name, role: user.role } };
}

export async function GET(request) {
  const access = await resolveSafeguardingAccess(request, "read");
  const legacyAdmin = isAdminAuthenticated(request);
  if (!legacyAdmin && !access.allowed) return unauthorized();
  const session = access.session;
  const actor = session ? session.name + " (" + session.username + ")" : "Authenticated VSI Admin";
  const user = session ? { username: session.username, displayName: session.name, role: session.role } : { username: "vsi-admin", displayName: "VSI Admin", role: "safeguarding_lead" };
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (id > 0) {
      const [report,notes,audit] = await Promise.all([
        pool.query("SELECT * FROM safeguarding_reports WHERE id=$1",[id]),
        pool.query("SELECT id,report_id,note_type,note_text,created_by,created_at FROM safeguarding_case_notes WHERE report_id=$1 ORDER BY created_at DESC LIMIT 100",[id]),
        pool.query("SELECT id,action,actor,details,created_at FROM safeguarding_audit_log WHERE report_id=$1 ORDER BY created_at DESC LIMIT 100",[id])
      ]);
      if (!report.rows[0]) return NextResponse.json({error:"Case not found."},{status:404});
      return NextResponse.json({report:report.rows[0],notes:notes.rows,audit:audit.rows,user});
    }
    const result = await pool.query("SELECT id,case_reference,received_at,reporter_type,anonymous,reporter_name,reporter_contact,safe_contact_method,affected_person_type,affected_person_age_band,concern_category,concern_details,incident_date,immediate_danger,safe_to_contact,status,urgency,assigned_to,updated_at,closed_at FROM safeguarding_reports ORDER BY CASE WHEN immediate_danger THEN 0 WHEN urgency='urgent' THEN 1 WHEN urgency='high' THEN 2 ELSE 3 END, received_at DESC LIMIT 250");
    return NextResponse.json({reports:result.rows,user});
  } catch (error) {
    console.error("Safeguarding admin GET failed:",error?.message||"unknown error");
    return NextResponse.json({error:"Unable to load safeguarding records."},{status:500});
  }
}

export async function PATCH(request) {
  const access = await resolveSafeguardingAccess(request, "write_cases");
  const legacyAdmin = isAdminAuthenticated(request);
  if (!legacyAdmin && !access.allowed) {
    if (access.session) return NextResponse.json({ error: "This account is read-only and cannot change case records." }, { status: 403 });
    return unauthorized();
  }
  const session = readSafeguardingSession(request);
  const actor = session ? session.name + " (" + session.username + ")" : "Authenticated VSI Admin";
  let client;
  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id) || id < 1) return NextResponse.json({error:"Invalid case."},{status:400});
    const fields = {};
    if (body.status !== undefined) { if (!statuses.has(body.status)) return NextResponse.json({error:"Invalid case status."},{status:400}); fields.status=body.status; }
    if (body.urgency !== undefined) { if (!urgencies.has(body.urgency)) return NextResponse.json({error:"Invalid urgency."},{status:400}); fields.urgency=body.urgency; }
    for (const [key,limit] of [["assignedTo",160],["riskAssessment",5000],["protectiveActions",5000],["referralDetails",5000],["outcomeSummary",5000]]) {
      if (body[key] !== undefined) fields[key]=clean(body[key],limit)||null;
    }
    if (!Object.keys(fields).length) return NextResponse.json({error:"No valid changes supplied."},{status:400});
    client=await pool.connect();
    await client.query("BEGIN");
    const current=await client.query("SELECT id,status,urgency,immediate_danger,risk_assessment,protective_actions,outcome_summary FROM safeguarding_reports WHERE id=$1 FOR UPDATE",[id]);
    if (!current.rows[0]) { await client.query("ROLLBACK"); return NextResponse.json({error:"Case not found."},{status:404}); }
    const existing=current.rows[0];
    const nextStatus=fields.status ?? existing.status;
    const nextUrgency=fields.urgency ?? existing.urgency;
    const nextRiskAssessment=fields.riskAssessment !== undefined ? fields.riskAssessment : existing.risk_assessment;
    const nextProtectiveActions=fields.protectiveActions !== undefined ? fields.protectiveActions : existing.protective_actions;
    const nextOutcomeSummary=fields.outcomeSummary !== undefined ? fields.outcomeSummary : existing.outcome_summary;
    if(nextStatus==="closed" && clean(nextOutcomeSummary,5000).length<20) {
      await client.query("ROLLBACK");
      return NextResponse.json({error:"Before closing this case, record a meaningful outcome and closure summary (at least 20 characters)."}, {status:400});
    }
    if(nextStatus==="closed" && existing.immediate_danger &&
       (clean(nextRiskAssessment,5000).length<20 || clean(nextProtectiveActions,5000).length<20)) {
      await client.query("ROLLBACK");
      return NextResponse.json({error:"An immediate-danger case cannot be closed until its risk reassessment and protective actions are documented (at least 20 characters each)."}, {status:400});
    }
    if(existing.immediate_danger && ["standard","unassessed"].includes(nextUrgency) &&
       (clean(nextRiskAssessment,5000).length<20 || clean(nextProtectiveActions,5000).length<20)) {
      await client.query("ROLLBACK");
      return NextResponse.json({error:"This report was flagged as immediate danger. Before reducing its urgency, document a risk reassessment and protective actions (at least 20 characters each)."}, {status:400});
    }
    const sets=[],values=[];
    const mapping={status:"status",urgency:"urgency",assignedTo:"assigned_to",riskAssessment:"risk_assessment",protectiveActions:"protective_actions",referralDetails:"referral_details",outcomeSummary:"outcome_summary"};
    for(const [key,value] of Object.entries(fields)){values.push(value);sets.push(mapping[key]+"=$"+values.length);}
    values.push(id);
    sets.push("updated_at=NOW()");
    if(fields.status==="closed") sets.push("closed_at=COALESCE(closed_at,NOW())");
    else if(fields.status && fields.status!=="closed") sets.push("closed_at=NULL");
    const updated=await client.query("UPDATE safeguarding_reports SET "+sets.join(",")+" WHERE id=$"+values.length+" RETURNING id,case_reference,status,urgency,assigned_to,updated_at,closed_at",values);
    await client.query("INSERT INTO safeguarding_audit_log(report_id,action,actor,details) VALUES($1,$2,$3,$4::jsonb)",[id,"case_updated",actor,JSON.stringify({changed:Object.keys(fields),previousStatus:existing.status,newStatus:nextStatus,previousUrgency:existing.urgency,newUrgency:nextUrgency})]);
    await client.query("COMMIT");
    return NextResponse.json({ok:true,report:updated.rows[0]});
  } catch(error) {
    if(client) await client.query("ROLLBACK").catch(()=>{});
    console.error("Safeguarding admin PATCH failed:",error?.message||"unknown error");
    return NextResponse.json({error:"Unable to update this safeguarding case."},{status:500});
  } finally { client?.release(); }
}

export async function POST(request) {
  const access = safeguardingPermission(request, "write_cases");
  const legacyAdmin = isAdminAuthenticated(request);
  if (!legacyAdmin && !access.allowed) {
    if (access.session) return NextResponse.json({ error: "This account is read-only and cannot add case notes." }, { status: 403 });
    return unauthorized();
  }
  const session = readSafeguardingSession(request);
  const actor = session ? session.name + " (" + session.username + ")" : "Authenticated VSI Admin";
  let client;
  try {
    const body=await request.json();
    const id=Number(body.id), noteType=clean(body.noteType,40), noteText=clean(body.noteText,5000);
    if(!Number.isInteger(id)||id<1||!noteTypes.has(noteType)||noteText.length<2) return NextResponse.json({error:"Provide a valid case, note category and note."},{status:400});
    client=await pool.connect();
    await client.query("BEGIN");
    const exists=await client.query("SELECT id FROM safeguarding_reports WHERE id=$1 FOR UPDATE",[id]);
    if(!exists.rows[0]){await client.query("ROLLBACK");return NextResponse.json({error:"Case not found."},{status:404});}
    const note=await client.query("INSERT INTO safeguarding_case_notes(report_id,note_type,note_text,created_by) VALUES($1,$2,$3,$4) RETURNING id,report_id,note_type,note_text,created_by,created_at",[id,noteType,noteText,actor]);
    await client.query("UPDATE safeguarding_reports SET updated_at=NOW() WHERE id=$1",[id]);
    await client.query("INSERT INTO safeguarding_audit_log(report_id,action,actor,details) VALUES($1,$2,$3,$4::jsonb)",[id,"note_added",actor,JSON.stringify({noteType})]);
    await client.query("COMMIT");
    return NextResponse.json({ok:true,note:note.rows[0]},{status:201});
  }catch(error){
    if(client) await client.query("ROLLBACK").catch(()=>{});
    console.error("Safeguarding admin POST failed:",error?.message||"unknown error");
    return NextResponse.json({error:"Unable to save the case note."},{status:500});
  }finally{client?.release();}
}
