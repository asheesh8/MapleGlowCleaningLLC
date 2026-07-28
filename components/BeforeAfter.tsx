'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MoveHorizontal, Sparkles } from 'lucide-react';
import { beforeAfter } from '@/lib/content';

const START = 50;

/**
 * Drag-to-compare slider.
 *
 * The wipe is driven by direct DOM writes inside a rAF, not React state, so a
 * drag never re-renders the two <Image>s. Pointer capture keeps the gesture
 * alive even when the cursor leaves the frame, and the handle is a real
 * role="slider" so it works from the keyboard without an overlay input
 * stealing pointer events.
 */
export function BeforeAfter() {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  /** Mirrors the wipe for aria/labels only — updated on release, not per frame. */
  const [committed, setCommitted] = useState(START);

  const frameRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(START);
  const rafRef = useRef<number | null>(null);

  const pair = beforeAfter[active];

  const paint = useCallback(() => {
    const p = posRef.current;
    if (clipRef.current) {
      clipRef.current.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
    }
    if (handleRef.current) {
      handleRef.current.style.left = `${p}%`;
    }
  }, []);

  /** Queue a paint at most once per frame. */
  const schedulePaint = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      paint();
    });
  }, [paint]);

  const setPos = useCallback(
    (next: number) => {
      posRef.current = Math.min(100, Math.max(0, next));
      schedulePaint();
    },
    [schedulePaint]
  );

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = frameRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return;
      setPos(((clientX - rect.left) / rect.width) * 100);
    },
    [setPos]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Reset the wipe when switching jobs so "before" always reads first.
  useEffect(() => {
    posRef.current = START;
    setCommitted(START);
    paint();
  }, [active, paint]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Ignore right/middle click so a context menu doesn't start a drag.
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setFromClientX(e.clientX);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setFromClientX(e.clientX);
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
    setCommitted(Math.round(posRef.current));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 10 : 2;
    let next: number | null = null;

    if (e.key === 'ArrowLeft') next = posRef.current - step;
    else if (e.key === 'ArrowRight') next = posRef.current + step;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 100;

    if (next === null) return;
    e.preventDefault();
    setPos(next);
    setCommitted(Math.round(posRef.current));
  }

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
        <div className="mx-auto mt-8 max-w-2xl">
          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDragStart={(e) => e.preventDefault()}
            className={`relative aspect-square w-full touch-none select-none overflow-hidden
                        rounded-4xl bg-espresso-950 shadow-lift ${
                          dragging ? 'cursor-grabbing' : 'cursor-ew-resize'
                        }`}
          >
            {/* After — full width, underneath */}
            <Image
              src={pair.after}
              alt={`${pair.label} after cleaning`}
              fill
              draggable={false}
              sizes="(max-width: 768px) 100vw, 672px"
              className="pointer-events-none select-none object-cover"
              priority
            />

            {/* Before — clipped to the handle position */}
            <div
              ref={clipRef}
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - START}% 0 0)` }}
            >
              <Image
                src={pair.before}
                alt={`${pair.label} before cleaning`}
                fill
                draggable={false}
                sizes="(max-width: 768px) 100vw, 672px"
                className="pointer-events-none select-none object-cover"
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

            {/* Divider + grab handle */}
            <div
              ref={handleRef}
              role="slider"
              tabIndex={0}
              aria-label={`Reveal before or after for ${pair.label}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={committed}
              aria-valuetext={`${committed}% before`}
              aria-orientation="horizontal"
              onKeyDown={onKeyDown}
              className="absolute inset-y-0 -ml-5 w-10 cursor-ew-resize"
              style={{ left: `${START}%` }}
            >
              {/* Vertical rule */}
              <span className="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2
                               bg-cream-50 shadow-[0_0_12px_rgba(0,0,0,0.45)]" />
              {/* Knob */}
              <span
                className={`pointer-events-none absolute left-1/2 top-1/2 flex h-12 w-12
                            -translate-x-1/2 -translate-y-1/2 items-center justify-center
                            rounded-full bg-cream-50 shadow-lift transition-transform
                            duration-150 ${dragging ? 'scale-110' : ''}`}
              >
                <MoveHorizontal
                  className="h-5 w-5 text-espresso-900"
                  strokeWidth={2.5}
                />
              </span>
            </div>
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
