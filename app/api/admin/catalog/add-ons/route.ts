import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { mapCleaningAddOn, uniqueAddOnId } from '@/lib/catalog';
import { prisma } from '@/lib/db';
import { catalogAddOnSchema } from '@/lib/validation';

export const runtime = 'nodejs';

function revalidateCatalogPages() {
  revalidatePath('/');
  revalidatePath('/services');
  revalidatePath('/book');
}

/** Admin only: create a new quote add-on. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = catalogAddOnSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Please check the add-on details.',
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const id = await uniqueAddOnId(data.name);
  const addOn = await prisma.cleaningAddOn.create({
    data: {
      id,
      name: data.name,
      price: data.price,
      order: data.order,
      active: data.active,
    },
  });

  revalidateCatalogPages();
  return NextResponse.json({ ok: true, addOn: mapCleaningAddOn(addOn) });
}
