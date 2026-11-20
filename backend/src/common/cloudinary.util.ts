import streamifier from 'streamifier';
import { cloudinary } from './cloudinary.config';

/**
 * Uploads an in-memory file buffer (from multer memoryStorage) to Cloudinary
 * and returns the resulting secure URL.
 */
export function uploadBufferToCloudinary(
  buffer: Buffer,
  filenamePrefix: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'fitp-visionary', public_id: `${filenamePrefix}-${Date.now()}` },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        resolve(result.secure_url);
      },
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Best-effort delete of a previously uploaded Cloudinary asset. Never
 * throws: a missing or already-deleted asset shouldn't fail the request
 * that's replacing or removing it.
 */
export async function deleteCloudinaryAsset(url: string | null): Promise<void> {
  if (!url?.includes('res.cloudinary.com')) return;
  const match = url.match(/\/fitp-visionary\/([^./]+)/);
  if (!match) return;
  try {
    await cloudinary.uploader.destroy(`fitp-visionary/${match[1]}`);
  } catch {
    // best-effort only
  }
}
