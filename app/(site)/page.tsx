import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { ServicesPreview } from '@/components/ServicesPreview';
import { CtaBand } from '@/components/CtaBand';
import { Testimonials, type Review } from '@/components/Testimonials';
import { prisma } from '@/lib/db';
import { getActiveCatalog } from '@/lib/catalog';
import galleryItems from '@/lib/gallery.json';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const catalog = await getActiveCatalog();
  let reviews: Review[] = [];
  try {
    reviews = await prisma.testimonial.findMany({
      where: { featured: true },
      orderBy: { order: 'asc' },
      select: { id: true, author: true, body: true, source: true },
      take: 3,
    });
  } catch {
    // A missing database should never take the marketing site down.
    reviews = [];
  }

  const peek = galleryItems.slice(0, 8);

  return (
    <>
      <Hero />
      <ServicesPreview services={catalog.services} />

      {/* Work teaser */}
      <section className="py-20 sm:py-24">
        <div className="container-mg">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">
                <Star className="h-3 w-3" />
                Her actual work
              </span>
              <h2 className="h-display mt-4 text-balance text-3xl sm:text-4xl">
                Straight from Katie&apos;s camera roll.
              </h2>
            </div>
            <Link href="/gallery" className="btn-ghost group">
              See all {galleryItems.length} photos
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {peek.map((item) => (
              <Link
                key={item.id}
                href="/gallery"
                className="group relative aspect-square overflow-hidden rounded-2xl bg-espresso-900"
              >
                <Image
                  src={item.src}
                  alt="Maple Glow Cleaning job photo"
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Testimonials reviews={reviews} />
      <CtaBand />
    </>
  );
}
