import {NextResponse} from "next/server";
import {ensureEventsTable,pool} from "../../../../lib/db";
import crypto from "node:crypto";

const clean=v=>typeof v==="string"?v.trim():"";
const MAX_BODY_BYTES=100000;
const RATE_LIMIT=10;

function getClientIp(request){
  const realIp=request.headers.get("x-real-ip")?.trim();
  if(realIp)return realIp;
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
}

function hashRateKey(ip){
  const secret=process.env.ADMIN_SESSION_SECRET||"vsi-event-registration-rate-limit";
  return crypto.createHmac("sha256",secret).update(ip).digest("hex");
}

export async function POST(request){
  try{
    const contentLength=Number(request.headers.get("content-length")||0);
    if(contentLength>MAX_BODY_BYTES)return NextResponse.json({error:"Registration data is too large."},{status:413});

    const b=await request.json();
    const eventId=Number(b.event_id);
    const fullName=clean(b.full_name);
    const designation=clean(b.designation);
    const email=clean(b.email).toLowerCase();
    const phone=clean(b.phone);
    const organization=clean(b.organization);
    const gender=clean(b.gender);
    const disability=clean(b.disability);
    const province=clean(b.province);
    const district=clean(b.district);
    const residentialArea=clean(b.residential_area);
    const attendanceMode=clean(b.attendance_mode)||"physical";
    const feeLabel=clean(b.fee_label);

    if(!Number.isInteger(eventId)||eventId<1||!fullName||!designation||!email||!phone||!gender||!disability||!province||!district||!residentialArea||!attendanceMode)return NextResponse.json({error:"Please complete all required registration fields."},{status:400});
    if(!["physical","virtual"].includes(attendanceMode))return NextResponse.json({error:"Please choose a valid attendance mode."},{status:400});
    if(fullName.length>120||designation.length>120||organization.length>160||gender.length>40||disability.length>80||province.length>80||district.length>80||residentialArea.length>120||feeLabel.length>120||phone.length>40)return NextResponse.json({error:"One or more registration fields are too long."},{status:400});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return NextResponse.json({error:"Please enter a valid email address."},{status:400});
    if(!/^[+0-9()\-\s]{7,40}$/.test(phone))return NextResponse.json({error:"Please enter a valid phone number."},{status:400});

    await ensureEventsTable();
    const e=await pool.query("SELECT id,title,slug,fee_options,status,event_date FROM vsi_events WHERE id=$1 LIMIT 1",[eventId]);
    if(!e.rowCount||e.rows[0].status!=="published")return NextResponse.json({error:"This event is not available for registration."},{status:404});
    const onlineOnly=e.rows[0].slug==="the-2026-founders-and-directors-synergy";if(onlineOnly&&attendanceMode!=="virtual")return NextResponse.json({error:"This event is available online only."},{status:400});const effectiveAttendanceMode=onlineOnly?"virtual":attendanceMode;const option=effectiveAttendanceMode==="physical"?(e.rows[0].fee_options||[]).find(x=>Number(x.amount)>0):null;
    const feeAmount=effectiveAttendanceMode==="virtual"?0:Number(option?.amount);
    const registrationFeeLabel=onlineOnly?"Online":(effectiveAttendanceMode==="virtual"?"Virtual — Free":String(option?.label||""));
    if(effectiveAttendanceMode==="physical"&&!option)return NextResponse.json({error:"A physical attendance fee has not been configured for this event."},{status:400});
    if(!Number.isFinite(feeAmount)||feeAmount<0||feeAmount>10000000)return NextResponse.json({error:"The selected event fee is invalid."},{status:400});


    const r=await pool.query("INSERT INTO vsi_event_registrations (event_id,full_name,designation,email,phone,organization,gender,disability,province,district,residential_area,fee_label,fee_amount,attendance_mode) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id,created_at",[eventId,fullName,designation,email,phone,organization||null,gender,disability,province,district,residentialArea,registrationFeeLabel,feeAmount,effectiveAttendanceMode]);
    return NextResponse.json({ok:true,registration:r.rows[0],event_title:e.rows[0].title});
  }catch(e){
    console.error("Event registration error:",e);
    return NextResponse.json({error:"Unable to complete registration."},{status:500});
  }
}
