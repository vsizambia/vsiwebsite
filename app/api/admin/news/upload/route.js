import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdminAuthenticated } from "../../../../../lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
    }

    // Vercel's News Blob store was connected with the custom `News` prefix.
    // The store ID is exposed as News_STORE_ID and its read/write credential
    // is exposed as News_READ_WRITE_TOKEN.
    const storeId =
      process.env.News_STORE_ID ||
      process.env.NEWS_STORE_ID ||
      process.env.News_BLOB_STORE_ID ||
      process.env.NEWS_BLOB_STORE_ID;
    const token =
      process.env.News_READ_WRITE_TOKEN ||
      process.env.NEWS_READ_WRITE_TOKEN ||
      process.env.News_BLOB_READ_WRITE_TOKEN ||
      process.env.NEWS_BLOB_READ_WRITE_TOKEN;

    if (!storeId || !token) {
      console.error("News Blob configuration is missing.", {
        hasStoreId: Boolean(storeId),
        hasToken: Boolean(token),
      });
      return NextResponse.json(
        { error: "News image storage is not configured. Please contact the VSI administrator." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Please select an image." }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Please choose a JPG, PNG or WebP image." }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be 8 MB or smaller." }, { status: 400 });
    }

    const originalName = String(file.name || "image").replace(/[^a-zA-Z0-9._-]/g, "-");
    const blob = await put(`news/${Date.now()}-${originalName}`, file, {
      access: "public",
      token,
      storeId,
      addRandomSuffix: true,
      contentType: file.type,
      cacheControlMaxAge: 31536000,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("News image upload error:", error);
    return NextResponse.json({ error: error?.message || "Unable to upload image." }, { status: 500 });
  }
}
