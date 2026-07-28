'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MoveHorizontal, Sparkles } from 'lucide-react';
import { beforeAfter } from '@/lib/content';

/**
 * Drag-to-compare slider. Pointer events cover mouse, touch, and pen, and the
 * handle is a real range input underneath so it stays keyboard-accessible.
 */
export function BeforeAfter() {
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const pair = beforeAfter[active];

  const setFromClientX = useCallback((clientX: number) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => setFromClientX(e.clientX);
    const up = () => setDragging(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [dragging, setFromClientX]);

  // Reset the wipe when switching jobs so the "before" always reads first.
  useEffect(() => setPos(50), [active]);

  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="glow-wash absolute inset-0 -z-10 opacity-60" />
      <div className="container-mg">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <Sparkles className="h-3 w-3" />
            Before &amp; after
          </span>
          <h2 className="h-display mt-5 text-balance text-3xl sm:text-4xl">
            Drag to see the difference.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-espresso-900/65">
            Same spot, same light — just photographed before Katie started and
            again when she finished.
          </p>
        </div>

        {/* Job picker */}
        <div className="no-scrollbar mt-9 flex justify-start gap-2 overflow-x-auto pb-1 sm:justify-center">
          {beforeAfter.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold
                          transition-all ${
                            i === active
                              ? 'border-espresso-950 bg-espresso-950 text-cream-50'
                              : 'border-espresso-900/12 bg-white text-espresso-900/65 hover:border-gold-400'
                          }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Comparison */}
        <div className="mx-auto mt-8 max-w-3xl">
          <div
            ref={frameRef}
            onPointerDown={(e) => {
              setDragging(true);
              setFromClientX(e.clientX);
            }}
            className="relative aspect-square w-full touch-none select-none overflow-hidden
                       rounded-4xl bg-espresso-950 shadow-lift sm:aspect-[4/3]"
          >
            {/* After (full width, underneath) */}
            <Image
              key={`${pair.id}-after`}
              src={pair.after}
              alt={`${pair.label} after cleaning`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />

            {/* Before (clipped to the handle position) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            >
              <Image
                key={`${pair.id}-before`}
                src={pair.before}
                alt={`${pair.label} before cleaning`}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>

            {/* Labels */}
            <span
              className="pointer-events-none absolute left-4 top-4 rounded-full bg-espresso-950/70
                         px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]
                         text-cream-50 backdrop-blur"
            >
              Before
            </span>
            <span
              className="pointer-events-none absolute right-4 top-4 rounded-full
                         bg-gradient-to-br from-gold-300 to-gold-500 px-3 py-1.5 text-[11px]
                         font-bold uppercase tracking-[0.14em] text-espresso-950"
            >
              After
            </span>

            {/* Divider + handle */}
            <div
              className="pointer-events-none absolute inset-y-0 w-0.5 bg-cream-50 shadow-[0_0_12px_rgba(0,0,0,0.45)]"
              style={{ left: `${pos}%` }}
            >
              <span
                className={`absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2
                            -translate-y-1/2 items-center justify-center rounded-full
                            bg-cream-50 shadow-lift transition-transform ${
                              dragging ? 'scale-110' : ''
                            }`}
              >
                <MoveHorizontal className="h-5 w-5 text-espresso-900" strokeWidth={2.5} />
              </span>
            </div>

            {/* Accessible control */}
            <label className="sr-only" htmlFor="ba-range">
              Reveal before or after for {pair.label}
            </label>
            <input
              id="ba-range"
              type="range"
              min={0}
              max={100}
              value={Math.round(pos)}
              onChange={(e) => setPos(Number(e.target.value))}
              className="absolute inset-x-0 bottom-0 h-10 w-full cursor-ew-resize opacity-0"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={pair.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-5 text-center text-pretty text-[15px] leading-relaxed text-espresso-900/65"
            >
              {pair.caption}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
