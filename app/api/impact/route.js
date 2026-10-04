import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT programme_key, number, title, category, description, metrics FROM vsi_impact_programmes ORDER BY number"
    );
    return NextResponse.json({ programmes: result.rows }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("Unable to load public Impact cards:", error);
    return NextResponse.json({ error: "Impact figures are temporarily unavailable." }, { status: 503 });
  }
}
