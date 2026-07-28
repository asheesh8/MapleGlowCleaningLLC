import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Services } from '@/components/Services';
import { BeforeAfter } from '@/components/BeforeAfter';
import { CtaBand } from '@/components/CtaBand';
import { getActiveCatalog } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Cleaning services across Vermont with transparent pricing and real before and after photos.',
};

export default async function ServicesPage() {
  const catalog = await getActiveCatalog();

  return (
    <>
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <Services services={catalog.services} />
      </Suspense>
      <BeforeAfter />
      <CtaBand />
    </>
  );
}
