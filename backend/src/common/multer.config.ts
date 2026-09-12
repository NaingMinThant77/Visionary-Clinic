import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Shared multer config for image uploads (avatars, card images).
 * Stores files on disk under ./uploads with a random filename so the
 * original name never collides, and rejects anything that isn't an image.
 */
export function imageUploadOptions(filenamePrefix: string): MulterOptions {
  return {
    storage: diskStorage({
      destination: './uploads',
      filename: (_req, file, callback) => {
        const uniqueName = `${filenamePrefix}-${randomUUID()}${extname(file.originalname)}`;
        callback(null, uniqueName);
      },
    }),
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
