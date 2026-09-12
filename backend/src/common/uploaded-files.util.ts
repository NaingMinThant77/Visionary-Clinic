import { Logger } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';

const logger = new Logger('UploadedFiles');

/**
 * Best-effort delete of a file previously saved under ./uploads (avatars,
 * card images). Never throws: a missing or already-deleted file shouldn't
 * fail the request that's replacing or removing it.
 */
export async function deleteUploadedFile(url: string | null): Promise<void> {
  if (!url?.startsWith('/uploads/')) return;
  try {
    await unlink(join(process.cwd(), url));
  } catch (error) {
    logger.warn(`Could not delete old upload ${url}: ${(error as Error).message}`);
  }
}
