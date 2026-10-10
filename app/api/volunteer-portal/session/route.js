import { NextResponse } from "next/server";
import { currentVolunteer } from "../../../../lib/volunteer-portal-auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const volunteer = await currentVolunteer();
    if (!volunteer) return NextResponse.json({error:"Please sign in to view your volunteer portal."},{status:401,headers:{"Cache-Control":"no-store"}});
    return NextResponse.json({volunteer},{headers:{"Cache-Control":"no-store"}});
  } catch (error) {
    console.error("Volunteer portal profile request failed.",error?.message||"unknown error");
    return NextResponse.json({error:"Unable to load your profile right now."},{status:500,headers:{"Cache-Control":"no-store"}});
  }
}
