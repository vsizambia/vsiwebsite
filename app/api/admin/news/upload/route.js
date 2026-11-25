import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdminAuthenticated } from "../../../../../lib/admin-auth";
import { randomUUID } from "node:crypto";
import { inspectImageUpload } from "../../../../../lib/secure-image-upload";

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

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 8 * 1024 * 1024 + 256 * 1024) {
      return NextResponse.json({ error: "Image upload is too large." }, { status: 413 });
    }
    const formData = await request.formData();
    const checked = await inspectImageUpload(formData.get("file"), 8 * 1024 * 1024);
    if (checked.error) return NextResponse.json({ error: checked.error }, { status: 400 });

    // Public images use a fixed image MIME and an opaque, non-user-controlled key.
    const blob = await put(`news/${randomUUID()}.${checked.extension}`, checked.bytes, {
      access: "public",
      token,
      storeId,
      addRandomSuffix: false,
      contentType: checked.contentType,
      cacheControlMaxAge: 31536000,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("News image upload error:", error);
    return NextResponse.json({ error: error?.message || "Unable to upload image." }, { status: 500 });
  }
}
