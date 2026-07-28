import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { testimonialPatchSchema } from '@/lib/validation';

export const runtime = 'nodejs';

/** Admin only: update a testimonial (edit text, toggle featured, reorder). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = testimonialPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid update.' }, { status: 400 });
  }

  try {
    const review = await prisma.testimonial.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ ok: true, review });
  } catch {
    return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
  }
}

/** Admin only: delete a testimonial. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.testimonial.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
  }
}
