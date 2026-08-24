import { NextResponse } from "next/server";
import { ensureEventsTable, pool } from "../../../lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(){try{await ensureEventsTable();const r=await pool.query("SELECT id,title,slug,category,summary,content,topic,speaker,featured_image,event_date,start_time,end_time,venue,location,registration_url,contact,directorate,programme,project,featured,published_at,fee_type,fee_amount,fee_note,fee_options,contact_name,contact_role,contact_phone,contact_email FROM vsi_events WHERE status='published' AND event_date >= CURRENT_DATE ORDER BY event_date ASC,start_time ASC,id ASC");const ids=r.rows.map(x=>x.id);const speakers=ids.length?await pool.query("SELECT id,event_id,name,title,institution,topic,photo_url,sort_order FROM event_speakers WHERE event_id = ANY($1::bigint[]) ORDER BY event_id,sort_order,id",[ids]):{rows:[]};const byEvent=new Map();for(const s of speakers.rows){if(!byEvent.has(String(s.event_id)))byEvent.set(String(s.event_id),[]);byEvent.get(String(s.event_id)).push(s)}return NextResponse.json({events:r.rows.map(x=>({...x,speakers:byEvent.get(String(x.id))||[]}))},{headers:{"Cache-Control":"no-store, max-age=0"}});}catch(e){console.error(e);return NextResponse.json({error:"Unable to load events."},{status:500,headers:{"Cache-Control":"no-store, max-age=0"}});}}
