import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { extname, join, resolve } from 'path';
import { v4 as uuid } from 'uuid';

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
]);

const PANORAMA_EXTRA_MIME_TYPES = new Set(['application/octet-stream']);

const VIDEO_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

function ensureDirectoryExists(path: string) {
  mkdirSync(path, { recursive: true });
}

export function getUploadsRoot(): string {
  return resolve(process.env.UPLOADS_PATH || join(process.cwd(), 'uploads'));
}

function createFileFilter(allowedMimeTypes: Set<string>) {
  return (
    _req: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new BadRequestException(`Unsupported file type: ${file.mimetype}`),
        false,
      );
      return;
    }

    callback(null, true);
  };
}

function createStorage(folder: string) {
  return diskStorage({
    destination: (_req, _file, callback) => {
      const path = join(getUploadsRoot(), folder);
      ensureDirectoryExists(path);
      callback(null, path);
    },
    filename: (_req, file, callback) => {
      callback(null, `${uuid()}${extname(file.originalname)}`);
    },
  });
}

export function createImageUploadOptions(folder = 'images'): MulterOptions {
  return {
    storage: createStorage(folder),
    fileFilter: createFileFilter(IMAGE_MIME_TYPES),
    limits: {
      fileSize: 15 * 1024 * 1024,
    },
  };
}

export function createPanoramaUploadOptions(
  folder = 'panoramas',
): MulterOptions {
  const panoramaFileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (IMAGE_MIME_TYPES.has(file.mimetype)) {
      callback(null, true);
      return;
    }

    const ext = extname(file.originalname || '').toLowerCase();
    if (PANORAMA_EXTRA_MIME_TYPES.has(file.mimetype) && ext === '.insp') {
      callback(null, true);
      return;
    }

    callback(
      new BadRequestException(`Unsupported file type: ${file.mimetype}`),
      false,
    );
  };

  return {
    storage: createStorage(folder),
    fileFilter: panoramaFileFilter,
    limits: {
      fileSize: 60 * 1024 * 1024,
    },
  };
}

export function createVideoUploadOptions(folder = 'videos'): MulterOptions {
  return {
    storage: createStorage(folder),
    fileFilter: createFileFilter(VIDEO_MIME_TYPES),
    limits: {
      fileSize: 100 * 1024 * 1024,
    },
  };
}
