import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";
import { getAdminTotpSecret, getAdminTotpUri } from "../../../../lib/totp";

export async function GET(request) {
  if (!isAdminAuthenticated(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const secret = getAdminTotpSecret();
  const uri = getAdminTotpUri();
  if (!secret || !uri) return NextResponse.json({ error: "Authenticator is not configured." }, { status: 503 });
  return NextResponse.json({ account: "VSI Admin", issuer: "VSI", secret, uri });
}
