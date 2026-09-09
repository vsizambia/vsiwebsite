import {NextResponse} from "next/server";
import {pool} from "../../../lib/db";

export const dynamic="force-dynamic";

export async function GET(){
  try{
    const result=await pool.query(`
      SELECT
        id,
        directorate,
        programme,
        project,
        activity_code,
        activity,
        sdgs,
        au_agenda_2063
      FROM vsi_master_activity_catalogue
      WHERE active = true
        AND COALESCE(project,'') <> ''
      ORDER BY project, COALESCE(programme,''), activity_code
    `);

    const projects={};
    for(const row of result.rows){
      const key=row.project.trim();
      if(!projects[key]){
        projects[key]={
          name:key,
          directorates:[],
          programmes:[],
          activities:[],
          sdgs:[],
          auAgenda2063:[]
        };
      }
      const p=projects[key];
      if(row.directorate && !p.directorates.includes(row.directorate))p.directorates.push(row.directorate);
      if(row.programme && !p.programmes.includes(row.programme))p.programmes.push(row.programme);
      if(row.activity_code && row.activity && !p.activities.some(a=>a.code===row.activity_code)){
        p.activities.push({code:row.activity_code,name:row.activity});
      }
      for(const value of String(row.sdgs||"").split(",").map(v=>v.trim()).filter(Boolean)){
        if(!p.sdgs.includes(value))p.sdgs.push(value);
      }
      for(const value of String(row.au_agenda_2063||"").split(",").map(v=>v.trim()).filter(Boolean)){
        if(!p.auAgenda2063.includes(value))p.auAgenda2063.push(value);
      }
    }

    return NextResponse.json({projects:Object.values(projects)});
  }catch(error){
    console.error("Public project catalogue GET failed:",error);
    return NextResponse.json({error:"Unable to load the public project catalogue."},{status:500});
  }
}
