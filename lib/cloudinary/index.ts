import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: "image" | "video";
  width?: number;
  height?: number;
  duration?: number;
}

export type MediaFolder =
  | "dnora/heroes"
  | "dnora/products"
  | "dnora/categories"
  | "dnora/reviews"
  | "dnora/customer-videos";

/**
 * Uploads a file buffer or base64 to Cloudinary
 * In demo mode without valid API secrets, gracefully generates a working asset representation.
 */
export async function uploadMedia(
  fileBuffer: Buffer,
  folder: MediaFolder,
  resourceType: "image" | "video" = "image",
  fileName?: string
): Promise<UploadResult> {
  const isCloudinaryConfigured =
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    !process.env.CLOUDINARY_API_KEY.includes("mock");

  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary API credentials are required for uploading media.");
  }

  return new Promise((resolve, reject) => {
    const cleanFileName = fileName ? fileName.replace(/\.[^/.]+$/, "") : `media_${Date.now()}`;
    const publicId = `${cleanFileName}_${Date.now()}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        transformation:
          resourceType === "image"
            ? [
                {
                  width: 1600,
                  height: 1600,
                  crop: "limit",
                  quality: "auto:good",
                  fetch_format: "auto",
                },
              ]
            : undefined,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          format: result.format,
          resource_type: result.resource_type as "image" | "video",
          width: result.width,
          height: result.height,
          duration: result.duration,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export { cloudinary };
