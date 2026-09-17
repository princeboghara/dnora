import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/session";
import { uploadMedia, MediaFolder } from "@/lib/cloudinary";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Server-Side Admin Authorization
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as MediaFolder) || "dnora/products";
    const resourceTypeParam = formData.get("resource_type") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2. MIME & Resource Type Validation
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Unsupported file type. Supported formats: JPEG, PNG, WEBP, AVIF, MP4, WEBM." },
        { status: 400 }
      );
    }

    // 3. Size Limits Validation
    const resourceType: "image" | "video" = resourceTypeParam === "video" || isVideo ? "video" : "image";
    const maxSize = resourceType === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds the limit of ${maxSize / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    // 4. Convert File to Buffer and Upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadMedia(buffer, folder, resourceType, file.name.split(".")[0]);

    return NextResponse.json({
      success: true,
      media: result,
    });
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload media. Please check server logs." },
      { status: 500 }
    );
  }
}
