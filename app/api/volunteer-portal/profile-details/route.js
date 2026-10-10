import { NextResponse } from "next/server";
import { pool, ensureVolunteerTable, ensureVolunteerFinanceTables } from "../../../../lib/db";
import { currentVolunteer } from "../../../../lib/volunteer-portal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isoDate = value => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toISOString().slice(0, 10);
};

export async function GET() {
  try {
    const sessionVolunteer = await currentVolunteer();
    if (!sessionVolunteer) {
      return NextResponse.json({ error: "Please sign in to view your volunteer profile." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    await Promise.all([ensureVolunteerTable(), ensureVolunteerFinanceTables()]);
    const [profileResult, activityResult, membershipResult, donationResult, otherPaymentResult, hoursResult] = await Promise.all([
      pool.query("SELECT * FROM volunteer_applications WHERE id=$1 AND LOWER(status)='approved' LIMIT 1", [sessionVolunteer.id]),
      pool.query("SELECT id,activity_date,activity_name,activity_code,project,location,start_time,end_time,hours,directorate,sdgs,au_agenda,description,supervisor_name,facilitator,verified FROM volunteer_activity_register WHERE volunteer_id=$1 ORDER BY activity_date DESC,start_time DESC", [sessionVolunteer.id]),
      pool.query("SELECT id,payment_month,amount_due,amount_paid,status,payment_date,payment_method,reference,notes FROM volunteer_membership_payments WHERE volunteer_id=$1 ORDER BY payment_month DESC,id DESC", [sessionVolunteer.id]),
      pool.query("SELECT id,cause,amount,donation_date,payment_method,reference,notes FROM volunteer_donations WHERE volunteer_id=$1 ORDER BY donation_date DESC,id DESC", [sessionVolunteer.id]),
      pool.query("SELECT id,description,amount,payment_date,payment_method,reference,notes FROM volunteer_other_payments WHERE volunteer_id=$1 ORDER BY payment_date DESC,id DESC", [sessionVolunteer.id]),
      pool.query(`SELECT
        COALESCE(SUM(CASE WHEN verified=true AND activity_date >= date_trunc('week',CURRENT_DATE)::date AND UPPER(TRIM(COALESCE(activity_code,''))) NOT LIKE 'FAHR%' THEN hours ELSE 0 END),0) AS week_hours,
        COALESCE(SUM(CASE WHEN verified=true AND UPPER(TRIM(COALESCE(activity_code,''))) NOT LIKE 'FAHR%' THEN hours ELSE 0 END),0) AS total_hours,
        COALESCE(SUM(CASE WHEN verified=true AND UPPER(TRIM(COALESCE(activity_code,''))) NOT LIKE 'FAHR%' THEN 1 ELSE 0 END),0) AS verified_activity_count,
        COALESCE(SUM(CASE WHEN verified=true AND UPPER(TRIM(COALESCE(activity_code,''))) LIKE 'FAHR%' THEN hours ELSE 0 END),0) AS development_hours
        FROM volunteer_activity_register WHERE volunteer_id=$1`, [sessionVolunteer.id])
    ]);

    if (!profileResult.rowCount) {
      return NextResponse.json({ error: "Approved volunteer profile not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    const profile = profileResult.rows[0];
    const activities = activityResult.rows.map(row => ({ ...row, activity_date: isoDate(row.activity_date) }));
    const payments = membershipResult.rows.map(row => ({ ...row, payment_month: isoDate(row.payment_month), payment_date: isoDate(row.payment_date) }));
    const donations = donationResult.rows.map(row => ({ ...row, donation_date: isoDate(row.donation_date) }));
    const otherPayments = otherPaymentResult.rows.map(row => ({ ...row, payment_date: isoDate(row.payment_date) }));
    const summary = hoursResult.rows[0] || {};

    return NextResponse.json({
      profile,
      activities,
      finance: { payments, donations, otherPayments },
      hours: {
        week: Number(summary.week_hours || 0),
        total: Number(summary.total_hours || 0),
        verifiedActivities: Number(summary.verified_activity_count || 0),
        development: Number(summary.development_hours || 0)
      }
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Volunteer portal detailed profile request failed.", error?.message || "unknown error");
    return NextResponse.json({ error: "Unable to load your complete profile right now." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
