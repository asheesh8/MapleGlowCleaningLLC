import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

/**
 * Customer photos show the inside of people's homes, so they are stored
 * OUTSIDE ./public and served only through the authenticated /api/photos route.
 */
export const UPLOAD_DIR = path.join(process.cwd(), 'private-uploads');

const MAGIC: { ext: string; mime: string; test: (b: Buffer) => boolean }[] = [
  {
    ext: 'jpg',
    mime: 'image/jpeg',
    test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: 'png',
    mime: 'image/png',
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    ext: 'webp',
    mime: 'image/webp',
    test: (b) =>
      b.subarray(0, 4).toString('ascii') === 'RIFF' &&
      b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
  {
    ext: 'heic',
    mime: 'image/heic',
    test: (b) => b.subarray(4, 8).toString('ascii') === 'ftyp',
  },
];

/**
 * Verify the bytes really are an image. Trusting the client-supplied MIME
 * type alone would let someone store an arbitrary file.
 */
export function sniffImage(
  buffer: Buffer
): { ext: string; mime: string } | null {
  if (buffer.length < 12) return null;
  const match = MAGIC.find((m) => m.test(buffer));
  return match ? { ext: match.ext, mime: match.mime } : null;
}

export async function saveImage(
  buffer: Buffer
): Promise<{ filename: string; mime: string } | null> {
  const sniffed = sniffImage(buffer);
  if (!sniffed) return null;

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${sniffed.ext}`;
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return { filename, mime: sniffed.mime };
}

/**
 * Resolve a stored filename to a path, refusing anything that escapes
 * the upload directory.
 */
export function resolveUploadPath(filename: string): string | null {
  if (!/^[a-f0-9-]{36}\.[a-z0-9]{3,4}$/i.test(filename)) return null;
  const full = path.join(UPLOAD_DIR, filename);
  if (path.dirname(full) !== UPLOAD_DIR) return null;
  return full;
}
