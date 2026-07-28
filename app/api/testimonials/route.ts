import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { testimonialSchema } from '@/lib/validation';

export const runtime = 'nodejs';

/** Admin-side: create a testimonial. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please fill in both the name and the review.' },
      { status: 400 }
    );
  }

  const created = await prisma.testimonial.create({ data: parsed.data });
  return NextResponse.json({ ok: true, review: created });
}
