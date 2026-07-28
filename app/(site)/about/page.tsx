import type { Metadata } from 'next';
import { About } from '@/components/About';
import { Testimonials, type Review } from '@/components/Testimonials';
import { CtaBand } from '@/components/CtaBand';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Katie',
  description:
    'Meet Katie Proper, owner of Maple Glow Cleaning LLC — a fully insured, owner-operated cleaning business serving all of Vermont.',
};

export default async function AboutPage() {
  let reviews: Review[] = [];
  try {
    reviews = await prisma.testimonial.findMany({
      where: { featured: true },
      orderBy: { order: 'asc' },
      select: { id: true, author: true, body: true, source: true },
      take: 9,
    });
  } catch {
    reviews = [];
  }

  return (
    <>
      <About />
      <Testimonials reviews={reviews} />
      <CtaBand />
    </>
  );
}
