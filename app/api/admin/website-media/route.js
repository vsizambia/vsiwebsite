import { NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";
import { randomUUID } from "node:crypto";
import { inspectImageUpload } from "../../../../lib/secure-image-upload";

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
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 10 * 1024 * 1024 + 256 * 1024) {
      return NextResponse.json({ error: "Image upload is too large." }, { status: 413 });
    }
    const form = await request.formData();
    const checked = await inspectImageUpload(form.get("file"), 10 * 1024 * 1024);
    if (checked.error) return NextResponse.json({ error: checked.error }, { status: 400 });

    // Opaque server-generated object key: never use attacker-controlled filenames.
    const pathname = `website-media/${randomUUID()}.${checked.extension}`;
    const blob = await put(pathname, checked.bytes, {
      access: "private",
      addRandomSuffix: false,
      contentType: checked.contentType,
    });
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
