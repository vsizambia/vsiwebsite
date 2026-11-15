import {NextResponse} from "next/server";
import {pool} from "../../../../lib/db";

export async function GET(){
  try{
    const result=await pool.query(`
      SELECT
        activity_code AS code,
        activity AS name,
        project,
        directorate,
        sdgs,
        au_agenda_2063 AS au
      FROM vsi_master_activity_catalogue
      WHERE active IS TRUE
      ORDER BY directorate,COALESCE(programme,''),COALESCE(project,''),activity
    `);
    return NextResponse.json({activities:result.rows},{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    console.error("Public activity catalogue GET failed:",error);
    return NextResponse.json({error:"Unable to load the approved VSI activity catalogue."},{status:500});
  }
}
