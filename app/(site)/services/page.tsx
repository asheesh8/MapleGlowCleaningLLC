import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Services } from '@/components/Services';
import { BeforeAfter } from '@/components/BeforeAfter';
import { CtaBand } from '@/components/CtaBand';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Residential & Airbnb cleaning, deep cleans, window cleaning, grout sealing, stain removal, carpet cleaning, and trash removal across Vermont — with real before and after photos.',
};

export default function ServicesPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <Services />
      </Suspense>
      <BeforeAfter />
      <CtaBand />
    </>
  );
}
