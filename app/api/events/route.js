import { NextResponse } from "next/server";
import { ensureEventsTable, pool } from "../../../lib/db";

export async function GET(){try{await ensureEventsTable();const r=await pool.query("SELECT id,title,slug,category,summary,content,featured_image,event_date,start_time,end_time,venue,location,registration_url,contact,directorate,programme,project,featured,published_at FROM vsi_events WHERE status='published' AND event_date >= CURRENT_DATE ORDER BY event_date ASC,start_time ASC,id ASC");return NextResponse.json({events:r.rows});}catch(e){console.error(e);return NextResponse.json({error:"Unable to load events."},{status:500});}}
