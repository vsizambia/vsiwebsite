import {NextResponse} from "next/server";
import {pool,ensureVolunteerTable,ensureNewsTable,ensureEventsTable} from "../../../../lib/db";
import {isAdminAuthenticated} from "../../../../lib/admin-auth";

const unauthorized=()=>NextResponse.json({error:"Admin authentication required."},{status:401});

export async function GET(request){
  if(!isAdminAuthenticated(request))return unauthorized();
  try{
    await Promise.all([ensureVolunteerTable(),ensureNewsTable(),ensureEventsTable()]);

    const [volunteers,volunteerHours,news,events,registrations,catalogue]=await Promise.all([
      pool.query(`SELECT COUNT(*) FILTER (WHERE status='approved')::int approved,COUNT(*) FILTER (WHERE status='pending')::int pending FROM volunteer_applications`),
      pool.query(`SELECT COALESCE(SUM(a.hours),0) total_hours FROM volunteer_activity_register a JOIN volunteer_applications v ON v.id=a.volunteer_id WHERE v.status='approved' AND a.verified=true AND UPPER(TRIM(COALESCE(a.activity_code,''))) NOT LIKE 'FAHR%'`),
      pool.query(`SELECT COUNT(*) FILTER (WHERE status='published')::int published,COUNT(*)::int total FROM news_articles`),
      pool.query(`SELECT COUNT(*) FILTER (WHERE event_date>=CURRENT_DATE AND status='published')::int upcoming,COUNT(*) FILTER (WHERE event_date<CURRENT_DATE)::int completed FROM vsi_events`),
      pool.query(`SELECT COUNT(*)::int total FROM vsi_event_registrations`),
      pool.query(`SELECT COUNT(*) FILTER (WHERE active=true)::int activities,COUNT(DISTINCT project) FILTER (WHERE active=true AND NULLIF(TRIM(project),'') IS NOT NULL)::int projects,COUNT(DISTINCT directorate) FILTER (WHERE active=true)::int directorates FROM vsi_master_activity_catalogue`)
    ]);

    return NextResponse.json({
      volunteers:{approved:volunteers.rows[0]?.approved||0,pending:volunteers.rows[0]?.pending||0,verifiedHours:Number(volunteerHours.rows[0]?.total_hours||0)},
      news:{published:news.rows[0]?.published||0,total:news.rows[0]?.total||0},
      events:{upcoming:events.rows[0]?.upcoming||0,registrations:registrations.rows[0]?.total||0,completed:events.rows[0]?.completed||0},
      catalogue:{activities:catalogue.rows[0]?.activities||0,projects:catalogue.rows[0]?.projects||0,directorates:catalogue.rows[0]?.directorates||0}
    });
  }catch(e){
    console.error("Admin dashboard summary failed:",e);
    return NextResponse.json({error:"Unable to load dashboard summaries."},{status:500});
  }
}
