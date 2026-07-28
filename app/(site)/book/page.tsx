import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BookingWizard } from '@/components/BookingWizard';

export const metadata: Metadata = {
  title: 'Get an instant quote',
  description:
    'Answer four quick questions, add optional photos of your space, and get an instant cleaning estimate from Maple Glow Cleaning.',
};

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <BookingWizard />
    </Suspense>
  );
}
