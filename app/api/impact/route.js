import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [programmes, activities] = await Promise.all([
      pool.query("SELECT programme_key, number, title, category, description, metrics FROM vsi_impact_programmes ORDER BY number"),
      pool.query(`SELECT a.id,a.programme_key,a.activity_name,a.activity_date,a.province,a.district,a.constituency,a.ward,a.partner,a.male_reached,a.female_reached,a.marketeers_reached,a.documents_contributed,a.institutions_engaged,a.catalogue_activity_code,c.activity_code,c.project,c.sdgs,c.au_agenda_2063
        FROM vsi_impact_activities a
        LEFT JOIN vsi_master_activity_catalogue c ON c.activity_code=a.catalogue_activity_code
        ORDER BY a.activity_date DESC,a.id DESC`)
    ]);
    return NextResponse.json(
      { programmes: programmes.rows, activities: activities.rows },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Unable to load public Impact dashboard:", error);
    return NextResponse.json({ error: "Impact figures are temporarily unavailable." }, { status: 503 });
  }
}
