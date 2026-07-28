import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { statusSchema } from '@/lib/validation';

export const runtime = 'nodejs';

/** Admin-side: update a booking's status. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, status: true },
    });
    return NextResponse.json({ ok: true, booking });
  } catch {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }
}

/** Admin-side: delete a booking and its photos. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }
}
