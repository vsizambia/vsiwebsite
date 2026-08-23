import { NextResponse } from "next/server";
import { ensureNewsTable, pool } from "../../../../lib/db";

export async function GET(_request, { params }) {
  try {
    await ensureNewsTable();
    const r = await pool.query(`SELECT id,title,slug,category,excerpt,content,featured_image,author,directorate,programme,project,featured,published_at FROM news_articles WHERE status='published' AND slug=$1 LIMIT 1`, [params.slug]);
    if (!r.rowCount) return NextResponse.json({ error: "News story not found." }, { status: 404 });
    return NextResponse.json({ article: r.rows[0] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Public news article error:", error);
    return NextResponse.json({ error: "Unable to load news story." }, { status: 500 });
  }
}
