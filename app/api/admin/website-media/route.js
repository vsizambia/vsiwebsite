import { NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

const unauthorized = () => NextResponse.json({ error: "Admin authentication required." }, { status: 401 });

function proxyUrl(request, blobUrl) {
  const url = new URL("/api/website-media", request.url);
  url.searchParams.set("url", blobUrl);
  return url.toString();
}

export async function GET(request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  try {
    const url = new URL(request.url);
    const prefix = url.searchParams.get("prefix") || "website-media/";
    const result = await list({ prefix, limit: 100 });
    const blobs = result.blobs.map((blob) => ({
      ...blob,
      url: proxyUrl(request, blob.url),
    }));
    return NextResponse.json({ blobs });
  } catch (error) {
    console.error("Website media list:", error);
    return NextResponse.json({ error: "Unable to load media library." }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Please select an image." }, { status: 400 });
    }
    if (!String(file.type || "").startsWith("image/")) {
      return NextResponse.json({ error: "Only image files can be uploaded." }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be 10 MB or smaller." }, { status: 400 });
    }
    const safeName = String(file.name || "image").replace(/[^a-zA-Z0-9._-]/g, "-");
    const pathname = `website-media/${Date.now()}-${safeName}`;
    const blob = await put(pathname, file, { access: "private", addRandomSuffix: false });
    return NextResponse.json({
      blob: {
        ...blob,
        url: proxyUrl(request, blob.url),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Website media upload:", error);
    return NextResponse.json({ error: "Unable to upload image." }, { status: 500 });
  }
}
