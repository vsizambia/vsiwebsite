import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

const unauthorized = () => NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
const PROGRAMME_KEYS = ["ovc-support", "clean-green-healthy", "education-support", "policy-contribution"];
const clean = (value, max = 500) => typeof value === "string" ? value.trim().slice(0, max) : "";

function normaliseMetrics(value) {
  if (!Array.isArray(value)) return null;
  const metrics = value.map((metric) => {
    const raw = metric?.value;
    const number = raw === "" || raw === null || raw === undefined ? null : Number(raw);
    return { key: clean(metric?.key, 60), label: clean(metric?.label, 90), value: number };
  });
  if (metrics.some((metric) => !metric.key || !metric.label || (metric.value !== null && (!Number.isSafeInteger(metric.value) || metric.value < 0)))) return null;
  return metrics;
}

export async function GET(request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  try {
    const result = await pool.query("SELECT programme_key, number, title, category, description, metrics, updated_at FROM vsi_impact_programmes ORDER BY number");
    return NextResponse.json({ programmes: result.rows });
  } catch (error) {
    console.error("Unable to load impact programmes:", error);
    return NextResponse.json({ error: "Unable to load Impact cards. Confirm the VSI Impact migration has been applied." }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "A valid JSON request is required." }, { status: 400 }); }
  if (!Array.isArray(body?.programmes) || body.programmes.length !== PROGRAMME_KEYS.length) {
    return NextResponse.json({ error: "All four Impact programmes must be submitted together." }, { status: 400 });
  }
  const programmes = [];
  for (const item of body.programmes) {
    const key = clean(item?.programme_key, 60);
    const metrics = normaliseMetrics(item?.metrics);
    if (!PROGRAMME_KEYS.includes(key) || programmes.some((p) => p.programme_key === key) ||
        !clean(item?.title, 120) || !clean(item?.category, 80) || !clean(item?.description, 500) || !metrics) {
      return NextResponse.json({ error: "Check each programme title, category, description and metric values. Metrics must be whole numbers zero or higher, or left blank." }, { status: 400 });
    }
    programmes.push({ programme_key: key, title: clean(item.title, 120), category: clean(item.category, 80), description: clean(item.description, 500), metrics });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const programme of programmes) {
      const updated = await client.query(
        "UPDATE vsi_impact_programmes SET title=$1, category=$2, description=$3, metrics=$4::jsonb, updated_at=NOW() WHERE programme_key=$5",
        [programme.title, programme.category, programme.description, JSON.stringify(programme.metrics), programme.programme_key]
      );
      if (!updated.rowCount) throw new Error("Impact programme seed data is missing; reapply the migration.");
    }
    await client.query("COMMIT");
    const result = await client.query("SELECT programme_key, number, title, category, description, metrics, updated_at FROM vsi_impact_programmes ORDER BY number");
    return NextResponse.json({ ok: true, programmes: result.rows });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Unable to save impact programmes:", error);
    return NextResponse.json({ error: "Unable to save Impact cards. Confirm the database migration is applied and the programme records exist." }, { status: 500 });
  } finally {
    client.release();
  }
}
