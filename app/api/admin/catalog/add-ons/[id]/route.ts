import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { mapCleaningAddOn } from '@/lib/catalog';
import { prisma } from '@/lib/db';
import { catalogAddOnPatchSchema } from '@/lib/validation';

export const runtime = 'nodejs';

function revalidateCatalogPages() {
  revalidatePath('/');
  revalidatePath('/services');
  revalidatePath('/book');
  revalidatePath('/admin');
}

/** Admin-side: update add-on name, pricing, ordering, or visibility. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = catalogAddOnPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Please check the add-on details.',
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const addOn = await prisma.cleaningAddOn.update({
      where: { id },
      data: parsed.data,
    });
    revalidateCatalogPages();
    return NextResponse.json({ ok: true, addOn: mapCleaningAddOn(addOn) });
  } catch {
    return NextResponse.json({ error: 'Add-on not found.' }, { status: 404 });
  }
}
