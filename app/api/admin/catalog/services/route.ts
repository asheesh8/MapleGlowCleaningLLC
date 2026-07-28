import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  mapCleaningService,
  serializeIncludes,
  uniqueServiceId,
} from '@/lib/catalog';
import { catalogServiceSchema } from '@/lib/validation';

export const runtime = 'nodejs';

function revalidateCatalogPages() {
  revalidatePath('/');
  revalidatePath('/services');
  revalidatePath('/book');
}

/** Admin-side: create a new public service. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = catalogServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Please check the service details.',
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const id = await uniqueServiceId(data.name);
  const service = await prisma.cleaningService.create({
    data: {
      id,
      name: data.name,
      short: data.short,
      description: data.description,
      includes: serializeIncludes(data.includes),
      base: data.base,
      icon: data.icon,
      order: data.order,
      active: data.active,
    },
  });

  revalidateCatalogPages();
  return NextResponse.json({ ok: true, service: mapCleaningService(service) });
}
