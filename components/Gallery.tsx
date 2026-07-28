'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import items from '@/lib/gallery.json';

const PAGE = 12;

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const [shown, setShown] = useState(PAGE);

  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(
    () => setOpen((i) => (i === null ? null : (i - 1 + items.length) % items.length)),
    []
  );
  const next = useCallback(
    () => setOpen((i) => (i === null ? null : (i + 1) % items.length)),
    []
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, prev, next]);

  return (
    <section id="work" className="relative py-24 sm:py-28 lg:py-32">
      <div className="container-mg">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <Camera className="h-3 w-3" />
            Her actual work
          </span>
          <h1 className="h-display mt-5 text-balance text-4xl sm:text-5xl">
            Real jobs. Real Vermont homes.
          </h1>
          <p className="mt-5 text-pretty text-[17px] leading-relaxed text-espresso-900/65">
            Every photo below comes straight from Katie&apos;s own page. Tap any
            one to see it full size.
          </p>
        </div>

        <div className="mt-12 columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
          {items.slice(0, shown).map((item, i) => (
            <motion.button
              key={item.id}
              onClick={() => setOpen(i)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: (i % PAGE) * 0.03 }}
              className="group relative mb-3 block w-full overflow-hidden rounded-2xl
                         bg-espresso-900 sm:mb-4"
              aria-label="View photo full size"
            >
              <Image
                src={item.src}
                alt="Maple Glow Cleaning job photo"
                width={800}
                height={800}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <span
                className="pointer-events-none absolute inset-0 transition-colors
                           duration-300 group-hover:bg-espresso-950/20"
              />
            </motion.button>
          ))}
        </div>

        {shown < items.length && (
          <div className="mt-10 text-center">
            <button onClick={() => setShown((s) => s + PAGE * 2)} className="btn-ghost">
              Show more ({items.length - shown} left)
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-espresso-950/95 p-4"
            onClick={close}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-cream-50
                         transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous"
              className="absolute left-3 rounded-full bg-white/10 p-3 text-cream-50
                         transition-colors hover:bg-white/20 sm:left-8"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <motion.div
              key={open}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="relative max-h-[85vh] w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={items[open].src}
                alt="Maple Glow Cleaning job photo"
                width={1536}
                height={1536}
                className="mx-auto h-auto max-h-[85vh] w-auto rounded-2xl object-contain"
                priority
              />
            </motion.div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next"
              className="absolute right-3 rounded-full bg-white/10 p-3 text-cream-50
                         transition-colors hover:bg-white/20 sm:right-8"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <span className="absolute bottom-5 text-[13px] tabular-nums text-cream-200/50">
              {open + 1} / {items.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
