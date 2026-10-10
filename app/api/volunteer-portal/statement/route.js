import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";
import { currentVolunteer } from "../../../../lib/volunteer-portal-auth";

export const runtime = "nodejs";
const money = value => Math.round((Number(value)||0)*100)/100;
export async function GET() {
  try {
    const volunteer = await currentVolunteer();
    if (!volunteer) return NextResponse.json({error:"Please sign in to view your volunteer portal."},{status:401,headers:{"Cache-Control":"no-store"}});
    const paymentsResult = await pool.query(
      `SELECT payment_month,amount_due,amount_paid,status,payment_date,payment_method,reference,notes
         FROM volunteer_membership_payments WHERE volunteer_id=$1 ORDER BY payment_month ASC`,
      [volunteer.id]
    );
    const start = new Date(volunteer.created_at);
    const now = new Date();
    const first = new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth(),1));
    const last = new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1));
    const monthCount = first > last ? 0 : (last.getUTCFullYear()-first.getUTCFullYear())*12 + last.getUTCMonth()-first.getUTCMonth()+1;
    const expected = monthCount * 30;
    const byMonth = new Map();
    for (const row of paymentsResult.rows) {
      const d = new Date(row.payment_month);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
      const paid = money(row.amount_paid);
      byMonth.set(key,{month:key,amountDue:30,amountPaid:money((byMonth.get(key)?.amountPaid||0)+paid),recordedStatus:row.status,paymentDate:row.payment_date,paymentMethod:row.payment_method,reference:row.reference,notes:row.notes});
    }
    const months = [];
    for (let i=0;i<monthCount;i++) {
      const d = new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+i,1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
      const payment = byMonth.get(key);
      const paid = money(payment?.amountPaid||0);
      months.push({month:key,amountDue:30,amountPaid:paid,balance:money(30-paid),status:paid>=30?"Paid":paid>0?"Part-paid":"Unpaid",paymentDate:payment?.paymentDate||null,paymentMethod:payment?.paymentMethod||null,reference:payment?.reference||null});
    }
    const paidTotal = money(paymentsResult.rows.reduce((sum,row)=>sum+Number(row.amount_paid||0),0));
    const overpayment = money(Math.max(0,paidTotal-expected));
    const outstanding = money(Math.max(0,expected-paidTotal));
    return NextResponse.json({statement:{currency:"ZMW",monthlyRate:30,firstContributionMonth:first.toISOString().slice(0,7),throughMonth:last.toISOString().slice(0,7),monthsExpected:monthCount,expectedTotal:money(expected),paidTotal,outstanding,credit:overpayment,months,adjustmentsIncluded:false,adjustmentNote:"Only recorded membership payments are included. Contact VSI administration if an approved waiver or adjustment is missing."}},{headers:{"Cache-Control":"no-store"}});
  } catch (error) {
    console.error("Volunteer portal statement request failed.",error?.message||"unknown error");
    return NextResponse.json({error:"Unable to load your contribution statement right now."},{status:500,headers:{"Cache-Control":"no-store"}});
  }
}
