import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import {
  mapCleaningService,
  serializeIncludes,
} from '@/lib/catalog';
import { prisma } from '@/lib/db';
import { catalogServicePatchSchema } from '@/lib/validation';

export const runtime = 'nodejs';

function revalidateCatalogPages() {
  revalidatePath('/');
  revalidatePath('/services');
  revalidatePath('/book');
  revalidatePath('/admin');
}

/** Admin-side: update service copy, pricing, ordering, or visibility. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = catalogServicePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Please check the service details.',
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { includes, ...rest } = parsed.data;
  const data = {
    ...rest,
    ...(includes ? { includes: serializeIncludes(includes) } : {}),
  };

  try {
    const service = await prisma.cleaningService.update({
      where: { id },
      data,
    });
    revalidateCatalogPages();
    return NextResponse.json({ ok: true, service: mapCleaningService(service) });
  } catch {
    return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
  }
}
