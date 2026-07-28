import type { Metadata } from 'next';
import { Gallery } from '@/components/Gallery';
import { CtaBand } from '@/components/CtaBand';

export const metadata: Metadata = {
  title: 'Her work',
  description:
    'Real before-and-after photos from Maple Glow Cleaning jobs across Vermont.',
};

export default function GalleryPage() {
  return (
    <>
      <Gallery />
      <CtaBand />
    </>
  );
}
