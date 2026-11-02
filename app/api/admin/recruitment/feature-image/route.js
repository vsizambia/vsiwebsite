import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { isAdminAuthenticated } from "../../../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE = 5 * 1024 * 1024;
const allowed = {
  "image/jpeg": { extension: "jpg", valid: bytes => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  "image/png": { extension: "png", valid: bytes => bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) },
  "image/webp": { extension: "webp", valid: bytes => bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" },
};

export async function POST(request) {
  if (!isAdminAuthenticated(request)) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file.arrayBuffer !== "function") return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    if (file.size < 1 || file.size > MAX_SIZE) return NextResponse.json({ error: "Image must be smaller than 5 MB." }, { status: 400 });
    const rule = allowed[file.type];
    if (!rule) return NextResponse.json({ error: "Use a JPG, PNG or WebP image." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!rule.valid(bytes)) return NextResponse.json({ error: "The selected file is not a valid image of the declared type." }, { status: 400 });
    const blob = await put(`recruitment/opportunities/${randomUUID()}.${rule.extension}`, bytes, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (error) {
    console.error("Recruitment feature image upload:", error);
    return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 500 });
  }
}
