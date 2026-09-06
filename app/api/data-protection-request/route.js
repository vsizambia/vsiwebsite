import { NextResponse } from "next/server";
import { ensureVolunteerTable, pool } from "../../../lib/db";

const clean=v=>typeof v==="string"?v.trim():"";
const allowed=new Set(["access","correction","deletion","withdraw_consent","processing_information","complaint"]);

export async function POST(request){
  try{
    const body=await request.json();
    const requestType=clean(body.requestType);
    const requesterName=clean(body.requesterName);
    const requesterEmail=clean(body.requesterEmail).toLowerCase();
    const details=clean(body.details);
    if(!allowed.has(requestType)||!requesterName||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requesterEmail)) return NextResponse.json({error:"Please provide a valid request type, name and email address."},{status:400});
    await ensureVolunteerTable();
    const r=await pool.query("INSERT INTO data_protection_requests (request_type,requester_name,requester_email,details) VALUES ($1,$2,$3,$4) RETURNING id,received_at",[requestType,requesterName,requesterEmail,details||null]);
    return NextResponse.json({ok:true,request:r.rows[0]},{status:201});
  }catch(error){
    console.error("Data protection request error:",error);
    return NextResponse.json({error:"Unable to submit your request. Please try again later."},{status:500});
  }
}