import {NextResponse} from "next/server";
import {pool,ensureVolunteerFinanceTables} from "../../../../lib/db";
import {isAdminAuthenticated} from "../../../../lib/admin-auth";
const unauthorized=()=>NextResponse.json({error:"Admin authentication required."},{status:401});
const monthStart=v=>{const d=v?new Date(v):new Date();return new Date(d.getFullYear(),d.getMonth(),1).toISOString().slice(0,10)};
export async function GET(request){
 if(!isAdminAuthenticated(request))return unauthorized();
 try{await ensureVolunteerFinanceTables();const {searchParams}=new URL(request.url);const volunteerId=searchParams.get("volunteerId");const params=volunteerId?[Number(volunteerId)]:[];
 const where=volunteerId?"WHERE p.volunteer_id=$1":"";
 const [payments,donations,spending,volunteers,summary]=await Promise.all([
  pool.query(`SELECT p.*,v.full_name,v.volunteer_id AS vsi_id FROM volunteer_membership_payments p JOIN volunteer_applications v ON v.id=p.volunteer_id ${where} ORDER BY p.payment_month DESC,v.full_name`,params),
  pool.query(`SELECT d.*,v.full_name,v.volunteer_id AS vsi_id FROM volunteer_donations d JOIN volunteer_applications v ON v.id=d.volunteer_id ${volunteerId?"WHERE d.volunteer_id=$1":""} ORDER BY d.donation_date DESC,d.id DESC`,params),
  pool.query(`SELECT * FROM volunteer_finance_spending ${volunteerId?"WHERE false":""} ORDER BY spending_date DESC,id DESC`,params),
  pool.query("SELECT id,full_name,volunteer_id FROM volunteer_applications WHERE status='approved' ORDER BY full_name"),
  pool.query(`SELECT COALESCE((SELECT SUM(amount_paid) FROM volunteer_membership_payments${volunteerId?" WHERE volunteer_id=$1":""}),0) membership_paid,COALESCE((SELECT SUM(CASE WHEN status IN ('unpaid','partial') THEN GREATEST(amount_due-amount_paid,0) ELSE 0 END) FROM volunteer_membership_payments${volunteerId?" WHERE volunteer_id=$1":""}),0) outstanding,COALESCE((SELECT SUM(amount_paid) FROM volunteer_membership_payments WHERE payment_month=date_trunc('month',CURRENT_DATE)::date AND status='paid'${volunteerId?" AND volunteer_id=$1":""}),0) paid_this_month,COALESCE((SELECT SUM(amount) FROM volunteer_donations${volunteerId?" WHERE volunteer_id=$1":""}),0) donations_total,COALESCE((SELECT SUM(amount) FROM volunteer_finance_spending),0) spent_total`,params)
 ]);
 const s=summary.rows[0]||{};const received=Number(s.membership_paid||0)+Number(s.donations_total||0);const spent=Number(s.spent_total||0);
 return NextResponse.json({payments:payments.rows,donations:donations.rows,spending:spending.rows,volunteers:volunteers.rows,summary:{...s,total_received:received,balance:received-spent}});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to load volunteer finance."},{status:500})}
}
export async function POST(request){
 if(!isAdminAuthenticated(request))return unauthorized();
 try{await ensureVolunteerFinanceTables();const b=await request.json();
 if(b.type==="membership"){
  const volunteerId=Number(b.volunteerId),amountDue=Number(b.amountDue||0),amountPaid=Number(b.amountPaid||0),status=b.status||"unpaid";
  if(!volunteerId)return NextResponse.json({error:"Volunteer is required."},{status:400});
  const r=await pool.query(`INSERT INTO volunteer_membership_payments(volunteer_id,payment_month,amount_due,amount_paid,status,payment_date,payment_method,reference,notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(volunteer_id,payment_month) DO UPDATE SET amount_due=EXCLUDED.amount_due,amount_paid=EXCLUDED.amount_paid,status=EXCLUDED.status,payment_date=EXCLUDED.payment_date,payment_method=EXCLUDED.payment_method,reference=EXCLUDED.reference,notes=EXCLUDED.notes,updated_at=NOW() RETURNING *`,[volunteerId,monthStart(b.paymentMonth),amountDue,amountPaid,status,b.paymentDate||null,b.paymentMethod||null,b.reference||null,b.notes||null]);return NextResponse.json({payment:r.rows[0]});
 }
 if(b.type==="donation"){
  const volunteerId=Number(b.volunteerId),amount=Number(b.amount||0);if(!volunteerId||amount<=0||!String(b.cause||"").trim())return NextResponse.json({error:"Volunteer, cause and amount are required."},{status:400});
  const r=await pool.query(`INSERT INTO volunteer_donations(volunteer_id,cause,amount,donation_date,payment_method,reference,notes) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,[volunteerId,String(b.cause).trim(),amount,b.donationDate||new Date().toISOString().slice(0,10),b.paymentMethod||null,b.reference||null,b.notes||null]);return NextResponse.json({donation:r.rows[0]});
 }
 if(b.type==="spending"){
  const amount=Number(b.amount||0);if(amount<=0||!String(b.category||"").trim()||!String(b.description||"").trim())return NextResponse.json({error:"Category, description and amount are required."},{status:400});
  const r=await pool.query(`INSERT INTO volunteer_finance_spending(category,description,amount,spending_date,cause,project,payment_method,reference,notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,[String(b.category).trim(),String(b.description).trim(),amount,b.spendingDate||new Date().toISOString().slice(0,10),b.cause||null,b.project||null,b.paymentMethod||null,b.reference||null,b.notes||null]);return NextResponse.json({spending:r.rows[0]});
 }
 return NextResponse.json({error:"Unknown finance record type."},{status:400});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to save volunteer finance record."},{status:500})}
}
export async function PATCH(request){
 if(!isAdminAuthenticated(request))return unauthorized();
 try{await ensureVolunteerFinanceTables();const b=await request.json();const id=Number(b.id);if(!id)return NextResponse.json({error:"Record ID is required."},{status:400});
 if(b.type==="membership"){
  const volunteerId=Number(b.volunteerId),amountDue=Number(b.amountDue||0),amountPaid=Number(b.amountPaid||0),status=b.status||"unpaid";
  if(!volunteerId)return NextResponse.json({error:"Volunteer is required."},{status:400});
  const r=await pool.query(`UPDATE volunteer_membership_payments SET volunteer_id=$1,payment_month=$2,amount_due=$3,amount_paid=$4,status=$5,payment_date=$6,payment_method=$7,reference=$8,notes=$9,updated_at=NOW() WHERE id=$10 RETURNING *`,[volunteerId,monthStart(b.paymentMonth),amountDue,amountPaid,status,b.paymentDate||null,b.paymentMethod||null,b.reference||null,b.notes||null,id]);if(!r.rowCount)return NextResponse.json({error:"Membership record not found."},{status:404});return NextResponse.json({payment:r.rows[0]});
 }
 if(b.type==="donation"){
  const volunteerId=Number(b.volunteerId),amount=Number(b.amount||0);if(!volunteerId||amount<=0||!String(b.cause||"").trim())return NextResponse.json({error:"Volunteer, cause and amount are required."},{status:400});
  const r=await pool.query(`UPDATE volunteer_donations SET volunteer_id=$1,cause=$2,amount=$3,donation_date=$4,payment_method=$5,reference=$6,notes=$7 WHERE id=$8 RETURNING *`,[volunteerId,String(b.cause).trim(),amount,b.donationDate||new Date().toISOString().slice(0,10),b.paymentMethod||null,b.reference||null,b.notes||null,id]);if(!r.rowCount)return NextResponse.json({error:"Donation record not found."},{status:404});return NextResponse.json({donation:r.rows[0]});
 }
 if(b.type==="spending"){
  const amount=Number(b.amount||0);if(amount<=0||!String(b.category||"").trim()||!String(b.description||"").trim())return NextResponse.json({error:"Category, description and amount are required."},{status:400});
  const r=await pool.query(`UPDATE volunteer_finance_spending SET category=$1,description=$2,amount=$3,spending_date=$4,cause=$5,project=$6,payment_method=$7,reference=$8,notes=$9 WHERE id=$10 RETURNING *`,[String(b.category).trim(),String(b.description).trim(),amount,b.spendingDate||new Date().toISOString().slice(0,10),b.cause||null,b.project||null,b.paymentMethod||null,b.reference||null,b.notes||null,id]);if(!r.rowCount)return NextResponse.json({error:"Spending record not found."},{status:404});return NextResponse.json({spending:r.rows[0]});
 }
 return NextResponse.json({error:"Unknown finance record type."},{status:400});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to update volunteer finance record."},{status:500})}
}
export async function DELETE(request){
 if(!isAdminAuthenticated(request))return unauthorized();
 try{await ensureVolunteerFinanceTables();const {searchParams}=new URL(request.url);const id=Number(searchParams.get("id")),type=searchParams.get("type");if(!id||!type)return NextResponse.json({error:"Record ID and type are required."},{status:400});
 const table=type==="membership"?"volunteer_membership_payments":type==="donation"?"volunteer_donations":type==="spending"?"volunteer_finance_spending":null;if(!table)return NextResponse.json({error:"Unknown finance record type."},{status:400});
 const r=await pool.query(`DELETE FROM ${table} WHERE id=$1 RETURNING id`,[id]);if(!r.rowCount)return NextResponse.json({error:"Finance record not found."},{status:404});return NextResponse.json({deleted:true,id});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to delete volunteer finance record."},{status:500})}
}