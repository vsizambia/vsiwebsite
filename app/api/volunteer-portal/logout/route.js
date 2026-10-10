import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "../../../../lib/db";
import { VOLUNTEER_PORTAL_COOKIE, originAllowed, sha256 } from "../../../../lib/volunteer-portal-auth";
export const runtime = "nodejs";
export async function POST(request) {
  if (!originAllowed(request)) return NextResponse.json({error:"Request could not be verified."},{status:403});
  try {
    const jar = await cookies();
    const token = jar.get(VOLUNTEER_PORTAL_COOKIE)?.value;
    if (token && /^[a-f0-9]{64}$/i.test(token)) await pool.query("DELETE FROM volunteer_portal_sessions WHERE token_hash=$1",[sha256(token)]);
    const response = NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
    response.cookies.set(VOLUNTEER_PORTAL_COOKIE,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:0});
    return response;
  } catch (error) {
    console.error("Volunteer portal logout failed.",error?.message||"unknown error");
    return NextResponse.json({error:"Unable to sign out right now."},{status:500});
  }
}
