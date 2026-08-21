import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

const unauthorized = () => NextResponse.json({ error: "Admin authentication required." }, { status: 401 });

export async function GET(request) {
  if (!isAdminAuthenticated(request)) return unauthorized();

  try {
    const rawUrl = request.nextUrl.searchParams.get("url");
    if (!rawUrl) return new NextResponse("Missing image", { status: 400 });

    const blobUrl = new URL(rawUrl);
    if (blobUrl.protocol !== "https:" || !blobUrl.hostname.endsWith(".private.blob.vercel-storage.com")) {
      return new NextResponse("Invalid image", { status: 400 });
    }

    const result = await get(blobUrl.toString(), { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return new NextResponse("Image not found", { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "image/jpeg",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-cache",
        ETag: result.blob.etag,
      },
    });
  } catch (error) {
    console.error("Volunteer photo error:", error);
    return new NextResponse("Unable to load image", { status: 500 });
  }
}
