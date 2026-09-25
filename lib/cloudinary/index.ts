import { v2 as cloudinary } from "cloudinary";

function configureCloudinary(): boolean {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl) {
    cloudinary.config(true);
    return true;
  }

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret && !apiKey.includes("mock")) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return true;
  }

  return false;
}

// Initial config
configureCloudinary();

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
  | "dnora/herobanner"
  | "dnora/heroes"
  | "dnora/products"
  | "dnora/categories"
  | "dnora/reviews"
  | "dnora/customer-videos";

/**
 * Uploads a file buffer or base64 to Cloudinary
 * Dynamically adapts to any new Cloudinary credentials set in .env
 */
export async function uploadMedia(
  fileBuffer: Buffer,
  folder: MediaFolder,
  resourceType: "image" | "video" = "image",
  fileName?: string
): Promise<UploadResult> {
  const isCloudinaryConfigured = configureCloudinary();

  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary credentials not configured. Please specify CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) in your .env file."
    );
  }

  return new Promise((resolve, reject) => {
    const cleanFileName = fileName ? fileName.replace(/\.[^/.]+$/, "") : `media_${Date.now()}`;
    const publicId = `${cleanFileName}_${Date.now()}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        // Preserve full original clarity and high resolution without forced downscaling
        transformation: undefined,
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
