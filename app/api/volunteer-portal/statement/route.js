import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";
import { currentVolunteer } from "../../../../lib/volunteer-portal-auth";
export const runtime = "nodejs";
const money = value => Math.round((Number(value)||0)*100)/100;
const localMonthParts = date => Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Lusaka",year:"numeric",month:"2-digit"}).formatToParts(date).filter(p=>p.type==="year"||p.type==="month").map(p=>[p.type,p.value]));
const monthKey = date => { const p=localMonthParts(date); return `${p.year}-${p.month}`; };
export async function GET() {
  try {
    const volunteer = await currentVolunteer();
    if (!volunteer) return NextResponse.json({error:"Please sign in to view your volunteer portal."},{status:401,headers:{"Cache-Control":"no-store"}});
    const paymentsResult = await pool.query(
      `SELECT payment_month,amount_paid,payment_date,payment_method,reference
         FROM volunteer_membership_payments WHERE volunteer_id=$1 ORDER BY payment_month ASC`,
      [volunteer.id]
    );
    const firstKey = monthKey(new Date(volunteer.created_at));
    const lastKey = monthKey(new Date());
    const [firstYear,firstMonth] = firstKey.split("-").map(Number);
    const [lastYear,lastMonth] = lastKey.split("-").map(Number);
    const first = new Date(Date.UTC(firstYear,firstMonth-1,1));
    const last = new Date(Date.UTC(lastYear,lastMonth-1,1));
    const monthCount = firstKey > lastKey ? 0 : (lastYear-firstYear)*12 + lastMonth-firstMonth+1;
    const expected = monthCount * 30;
    const eligiblePayments = paymentsResult.rows.filter(row => {
      const d = new Date(row.payment_month);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
      return key >= firstKey;
    });
    const byMonth = new Map();
    for (const row of eligiblePayments) {
      const d = new Date(row.payment_month);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
      const previous = byMonth.get(key);
      byMonth.set(key,{amountPaid:money((previous?.amountPaid||0)+Number(row.amount_paid||0)),paymentDate:row.payment_date||previous?.paymentDate||null,paymentMethod:row.payment_method||previous?.paymentMethod||null,reference:row.reference||previous?.reference||null});
    }
    const months = [];
    for (let i=0;i<monthCount;i++) {
      const d = new Date(Date.UTC(firstYear,firstMonth-1+i,1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
      const payment = byMonth.get(key);
      const paid = money(payment?.amountPaid||0);
      months.push({month:key,amountDue:30,amountPaid:paid,balance:money(Math.max(0,30-paid)),status:paid>=30?"Paid":paid>0?"Part-paid":"Unpaid",paymentDate:payment?.paymentDate||null,paymentMethod:payment?.paymentMethod||null,reference:payment?.reference||null});
    }
    const paidTotal = money(eligiblePayments.reduce((sum,row)=>sum+Number(row.amount_paid||0),0));
    const credit = money(Math.max(0,paidTotal-expected));
    const outstanding = money(Math.max(0,expected-paidTotal));
    return NextResponse.json({statement:{currency:"ZMW",monthlyRate:30,firstContributionMonth:firstKey,throughMonth:lastKey,monthsExpected:monthCount,expectedTotal:money(expected),paidTotal,outstanding,credit,months,adjustmentsIncluded:false,adjustmentNote:"Only recorded membership payments are included. Approved waivers or adjustments are not automatically applied; contact VSI administration to reconcile them."}},{headers:{"Cache-Control":"no-store"}});
  } catch (error) {
    console.error("Volunteer portal statement request failed.",error?.message||"unknown error");
    return NextResponse.json({error:"Unable to load your contribution statement right now."},{status:500,headers:{"Cache-Control":"no-store"}});
  }
}
