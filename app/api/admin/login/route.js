import { NextResponse } from "next/server";
import crypto from "node:crypto";

const COOKIE_NAME = "vsi_admin_session";
const MAX_AGE = 60 * 60 * 8;

function sign(value) {
  return crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(value).digest("hex");
}

export async function POST(request) {
  try {
    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.json({ error: "Admin access is not configured." }, { status: 503 });
    }

    const { password } = await request.json();
    if (typeof password !== "string" || !crypto.timingSafeEqual(Buffer.from(password), Buffer.from(process.env.ADMIN_PASSWORD))) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
    const payload = String(expires);
    const token = `${payload}.${sign(payload)}`;
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Unable to sign in." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
