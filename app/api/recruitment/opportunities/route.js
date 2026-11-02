import { NextResponse } from "next/server";
import { recruitmentPublicPool } from "../../../../lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    if (!recruitmentPublicPool) return NextResponse.json({ error: "Public recruitment access is not configured." }, { status: 503 });
    const result = await recruitmentPublicPool.query(`SELECT id,title,opportunity_type,department,duty_station,description,requirements,closing_date,feature_image_url
      FROM vsi_recruitment_opportunities
      WHERE status='published' AND (closing_date IS NULL OR closing_date >= CURRENT_DATE)
      ORDER BY closing_date ASC NULLS LAST, created_at DESC`);
    return NextResponse.json({ opportunities: result.rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Recruitment opportunities:", error);
    return NextResponse.json({ error: "Opportunities are temporarily unavailable." }, { status: 500 });
  }
}
