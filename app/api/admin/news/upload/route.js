import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { isAdminAuthenticated } from "../../../../../lib/admin-auth";

export async function POST(request) {
  if (!isAdminAuthenticated(request)) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  try {
    const body = await request.json();
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
        maximumSizeInBytes: 8 * 1024 * 1024,
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ admin: true, pathname }),
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log("VSI news image uploaded", blob.url);
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("News image upload error:", error);
    return NextResponse.json({ error: error?.message || "Unable to prepare image upload." }, { status: 400 });
  }
}
