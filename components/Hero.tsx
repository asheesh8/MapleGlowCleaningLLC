'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, MapPin, Clock, Sparkles, ArrowRight, Phone } from 'lucide-react';
import { business, trustPoints } from '@/lib/content';

const icons = [ShieldCheck, Sparkles, MapPin, Clock];

/** Decorative floating dust motes — the "glow" in Maple Glow. */
function Motes() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  const motes = [
    { x: '12%', y: '22%', s: 5, d: 0 },
    { x: '78%', y: '16%', s: 7, d: 1.2 },
    { x: '88%', y: '58%', s: 4, d: 2.4 },
    { x: '22%', y: '72%', s: 6, d: 0.8 },
    { x: '45%', y: '12%', s: 3, d: 1.8 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {motes.map((m, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gold-400"
          style={{ left: m.x, top: m.y, width: m.s, height: m.s }}
          animate={{ y: [0, -26, 0], opacity: [0.2, 0.75, 0.2] }}
          transition={{
            duration: 7 + i,
            repeat: Infinity,
            delay: m.d,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36">
      <div className="glow-wash absolute inset-0 -z-10" />
      <Motes />

      <div
        className="pointer-events-none absolute -left-32 -top-24 -z-10 h-[26rem] w-[26rem]
                   animate-pulse-glow rounded-full bg-gold-300/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-24 -z-10 h-[22rem] w-[22rem]
                   animate-pulse-glow rounded-full bg-sage-400/20 blur-3xl"
        style={{ animationDelay: '2s' }}
        aria-hidden
      />

      <div className="container-mg">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* ── Copy ── */}
          <div className="max-w-2xl">
            <motion.div {...rise(0)}>
              <span className="eyebrow">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-500 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-500" />
                </span>
                Now booking across Vermont
              </span>
            </motion.div>

            <motion.h1
              {...rise(0.08)}
              className="h-display mt-6 text-balance text-[2.6rem] leading-[1.03]
                         sm:text-6xl lg:text-[4.25rem]"
            >
              A clean space.{' '}
              <span className="relative inline-block">
                <span
                  className="bg-gradient-to-br from-gold-600 via-gold-400 to-gold-600
                             bg-clip-text text-transparent"
                >
                  A brighter you.
                </span>
                <motion.svg
                  viewBox="0 0 300 12"
                  className="absolute -bottom-2 left-0 w-full text-gold-400"
                  fill="none"
                  aria-hidden
                >
                  <motion.path
                    d="M2 8C60 3 140 2 298 6"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
                  />
                </motion.svg>
              </span>
            </motion.h1>

            <motion.p
              {...rise(0.16)}
              className="mt-8 max-w-xl text-pretty text-[17px] leading-relaxed
                         text-espresso-900/70 sm:text-lg"
            >
              Owner-operated, fully insured cleaning for Vermont homes and
              businesses. Katie is at every visit — no rotating crews, no
              strangers, no surprises on the invoice.
            </motion.p>

            <motion.div {...rise(0.24)} className="mt-9 flex flex-wrap items-center gap-3">
              <a href="#book" className="btn-maple group text-[15px]">
                Get my instant quote
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="#work" className="btn-ghost text-[15px]">
                See her work
              </a>
            </motion.div>

            <motion.p {...rise(0.3)} className="mt-5 text-[13.5px] text-espresso-900/50">
              Takes about 60 seconds · No card, no obligation · Reply within 24 hours
            </motion.p>
          </div>

          {/* ── Owner card ── */}
          <motion.div
            initial={{ opacity: 0, scale: reduce ? 1 : 0.94, y: reduce ? 0 : 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-5xl bg-espresso-950 p-2 shadow-lift">
              {/* Katie at work — from her own page */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2.25rem]">
                <Image
                  src="/katie.jpg"
                  alt="Katie, owner of Maple Glow Cleaning, cleaning a kitchen counter"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover object-[center_20%]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/10 to-transparent" />
              </div>

              <div className="glow-wash rounded-[2.25rem] px-7 pb-7 pt-6 sm:px-8">
                <div className="space-y-1">
                  {trustPoints.map((t, i) => {
                    const Icon = icons[i % icons.length];
                    return (
                      <motion.div
                        key={t.label}
                        initial={{ opacity: 0, x: reduce ? 0 : -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 + i * 0.09, duration: 0.5 }}
                        className="flex items-start gap-3.5 rounded-2xl px-2 py-2.5
                                   transition-colors hover:bg-white/5"
                      >
                        <Icon
                          className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gold-400"
                          strokeWidth={2.2}
                        />
                        <div>
                          <p className="text-[14.5px] font-semibold text-cream-50">
                            {t.label}
                          </p>
                          <p className="text-[13px] leading-snug text-cream-200/55">
                            {t.detail}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <a
                  href={business.phoneHref}
                  className="mt-5 flex items-center justify-between rounded-2xl
                             border border-gold-400/25 bg-gold-400/10 px-5 py-4
                             transition-colors hover:bg-gold-400/20"
                >
                  <span>
                    <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-gold-200/70">
                      Call or text Katie
                    </span>
                    <span className="h-display text-xl text-cream-50">
                      {business.phone.replace('+1 ', '')}
                    </span>
                  </span>
                  <Phone className="h-5 w-5 text-gold-400" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
