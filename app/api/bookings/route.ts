import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateQuote } from '@/lib/pricing';
import { getActiveCatalog } from '@/lib/catalog';
import { saveImage } from '@/lib/uploads';
import { bookingSchema, MAX_PHOTOS, MAX_UPLOAD_BYTES } from '@/lib/validation';

export const runtime = 'nodejs';

function makeReference(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `MG-${out}`;
}

/** Public: submit a booking request (multipart, optional photos). */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const raw = form.get('payload');
    if (typeof raw !== 'string') {
      return NextResponse.json({ error: 'Missing booking details.' }, { status: 400 });
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Booking details were malformed.' }, { status: 400 });
    }

    const result = bookingSchema.safeParse(parsedJson);
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Please check the highlighted fields.',
          fields: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    const data = result.data;
    const catalog = await getActiveCatalog();
    const serviceIds = new Set(catalog.services.map((service) => service.id));
    const addOnIds = new Set(catalog.addOns.map((addOn) => addOn.id));

    if (!serviceIds.has(data.serviceType)) {
      return NextResponse.json(
        {
          error: 'Please choose a current service.',
          fields: { serviceType: ['Please choose a current service.'] },
        },
        { status: 400 }
      );
    }

    const invalidAddOns = data.addOns.filter((id) => !addOnIds.has(id));
    if (invalidAddOns.length > 0) {
      return NextResponse.json(
        {
          error: 'One of those add-ons is no longer available.',
          fields: { addOns: ['Please choose current add-ons.'] },
        },
        { status: 400 }
      );
    }

    // Recompute the quote server-side — never trust a price from the client.
    const quote = calculateQuote({
      serviceType: data.serviceType,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      frequency: data.frequency,
      addOns: data.addOns,
    }, catalog);

    const photos = form
      .getAll('photos')
      .filter((f): f is File => f instanceof File && f.size > 0)
      .slice(0, MAX_PHOTOS);

    const saved: { filename: string; mimeType: string; size: number }[] = [];
    for (const photo of photos) {
      if (photo.size > MAX_UPLOAD_BYTES) continue;
      const buffer = Buffer.from(await photo.arrayBuffer());
      const stored = await saveImage(buffer);
      if (stored) {
        saved.push({
          filename: stored.filename,
          mimeType: stored.mime,
          size: buffer.length,
        });
      }
    }

    const booking = await prisma.booking.create({
      data: {
        reference: makeReference(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        zip: data.zip,
        serviceType: data.serviceType,
        frequency: data.frequency,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        sqft: data.sqft ?? null,
        addOns: data.addOns.join(','),
        preferredDate: data.preferredDate ?? null,
        preferredTime: data.preferredTime ?? null,
        notes: data.notes ?? null,
        estimateLow: quote.low,
        estimateHigh: quote.high,
        photos: { create: saved },
      },
      select: { reference: true, estimateLow: true, estimateHigh: true },
    });

    return NextResponse.json({
      ok: true,
      reference: booking.reference,
      estimateLow: booking.estimateLow,
      estimateHigh: booking.estimateHigh,
      photosReceived: saved.length,
    });
  } catch (err) {
    console.error('[bookings.POST]', err);
    return NextResponse.json(
      { error: 'Something went wrong on our end. Please call or text instead.' },
      { status: 500 }
    );
  }
}

/** Admin-side: list bookings. */
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status');
  const bookings = await prisma.booking.findMany({
    where: status && status !== 'all' ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { photos: { select: { id: true, filename: true } } },
    take: 300,
  });

  return NextResponse.json({ bookings });
}
