import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { prisma } from '@/lib/db';
import { resolveUploadPath } from '@/lib/uploads';

export const runtime = 'nodejs';

/**
 * Serves a customer-submitted photo. These show the inside of people's
 * homes, so keep this route off public-facing links.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = await prisma.bookingPhoto.findUnique({
    where: { id },
    select: { filename: true, mimeType: true },
  });
  if (!photo) return new NextResponse('Not found', { status: 404 });

  const filePath = resolveUploadPath(photo.filename);
  if (!filePath) return new NextResponse('Not found', { status: 404 });

  try {
    const bytes = await readFile(filePath);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': photo.mimeType,
        'Cache-Control': 'private, max-age=3600',
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
