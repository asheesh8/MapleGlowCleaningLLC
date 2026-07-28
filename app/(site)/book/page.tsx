import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BookingWizard } from '@/components/BookingWizard';
import { getActiveCatalog } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Get an instant quote',
  description:
    'Answer four quick questions, add optional photos of your space, and get an instant cleaning estimate from Maple Glow Cleaning.',
};

export default async function BookPage() {
  const catalog = await getActiveCatalog();

  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <BookingWizard services={catalog.services} addOns={catalog.addOns} />
    </Suspense>
  );
}
