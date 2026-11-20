import { BadRequestException } from '@nestjs/common';
// import { randomUUID } from 'crypto';
import { memoryStorage } from 'multer';
// import { diskStorage } from 'multer';
// import { extname } from 'path';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Shared multer config for image uploads (avatars, card images).
 * Keeps files in memory so they can be streamed straight to Cloudinary,
 * and rejects anything that isn't an image.
 */
export function imageUploadOptions(_filenamePrefix: string): MulterOptions {
  return {
    // Local disk storage (kept for reference, replaced by Cloudinary):
    // storage: diskStorage({
    //   destination: './uploads',
    //   filename: (_req, file, callback) => {
    //     const uniqueName = `${filenamePrefix}-${randomUUID()}${extname(file.originalname)}`;
    //     callback(null, uniqueName);
    //   },
    // }),
    storage: memoryStorage(),
    fileFilter: (_req, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        callback(
          new BadRequestException('Only image files are allowed'),
          false,
        );
        return;
      }
      callback(null, true);
    },
    limits: { fileSize: MAX_FILE_SIZE },
  };
}
