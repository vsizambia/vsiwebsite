import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { pool } from "../../../../lib/db";
import { currentVolunteer } from "../../../../lib/volunteer-portal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionVolunteer = await currentVolunteer();
    if (!sessionVolunteer) {
      return new NextResponse("Please sign in to view your profile photo.", {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const profileResult = await pool.query(
      "SELECT profile_picture FROM volunteer_applications WHERE id=$1 AND LOWER(status)='approved' LIMIT 1",
      [sessionVolunteer.id]
    );
    const profilePicture = profileResult.rows[0]?.profile_picture;
    if (!profilePicture || typeof profilePicture !== "string") {
      return new NextResponse("Profile photo not found.", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const blob = await get(profilePicture, { access: "private" });
    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return new NextResponse("Profile photo not found.", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return new NextResponse(blob.stream, {
      headers: {
        "Content-Type": blob.blob.contentType || "image/jpeg",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-cache",
        ETag: blob.blob.etag,
      },
    });
  } catch (error) {
    console.error("Volunteer profile photo request failed.", error?.message || "unknown error");
    return new NextResponse("Unable to load profile photo.", {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
