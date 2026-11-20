// import { Logger } from '@nestjs/common';
// import { unlink } from 'fs/promises';
// import { join } from 'path';
import { deleteCloudinaryAsset } from './cloudinary.util';

// const logger = new Logger('UploadedFiles');

/**
 * Best-effort delete of a file previously saved under ./uploads (avatars,
 * card images). Now delegates to Cloudinary since local disk storage is
 * no longer used.
 */
export async function deleteUploadedFile(url: string | null): Promise<void> {
  // Local disk deletion (kept for reference, replaced by Cloudinary):
  // if (!url?.startsWith('/uploads/')) return;
  // try {
  //   await unlink(join(process.cwd(), url));
  // } catch (error) {
  //   logger.warn(`Could not delete old upload ${url}: ${(error as Error).message}`);
  // }
  await deleteCloudinaryAsset(url);
}
