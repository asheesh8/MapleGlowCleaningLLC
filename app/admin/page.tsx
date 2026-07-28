import { prisma } from '@/lib/db';
import { getAdminCatalog } from '@/lib/catalog';
import { AdminDashboard, type AdminBooking } from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Bookings' };

export default async function AdminPage() {
  const [rows, catalog] = await Promise.all([
    prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { photos: { select: { id: true } } },
      take: 300,
    }),
    getAdminCatalog(),
  ]);

  const bookings: AdminBooking[] = rows.map((b) => ({
    id: b.id,
    reference: b.reference,
    name: b.name,
    email: b.email,
    phone: b.phone,
    address: b.address,
    city: b.city,
    zip: b.zip,
    serviceType: b.serviceType,
    frequency: b.frequency,
    bedrooms: b.bedrooms,
    bathrooms: b.bathrooms,
    sqft: b.sqft,
    addOns: b.addOns ? b.addOns.split(',').filter(Boolean) : [],
    preferredDate: b.preferredDate,
    preferredTime: b.preferredTime,
    notes: b.notes,
    estimateLow: b.estimateLow,
    estimateHigh: b.estimateHigh,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    photoIds: b.photos.map((p) => p.id),
  }));

  return (
    <AdminDashboard
      bookings={bookings}
      services={catalog.services}
      addOns={catalog.addOns}
    />
  );
}
