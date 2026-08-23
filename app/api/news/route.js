import { NextResponse } from "next/server";
import { ensureNewsTable, pool } from "../../../lib/db";

export async function GET() {
  try {
    await ensureNewsTable();
    const r = await pool.query(`SELECT id,title,slug,category,excerpt,content,featured_image,author,directorate,programme,project,featured,published_at FROM news_articles WHERE status='published' ORDER BY published_at DESC NULLS LAST, id DESC`);
    return NextResponse.json({ articles: r.rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Public news error:", error);
    return NextResponse.json({ error: "Unable to load news." }, { status: 500 });
  }
}
