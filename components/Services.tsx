'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  House,
  Box,
  Grid3x3,
  Droplet,
  Layers,
  PanelsTopLeft,
  Check,
  Plus,
} from 'lucide-react';
import type { CatalogService } from '@/lib/catalog-types';
import { PainMarquee } from './PainMarquee';
import { formatMoney } from '@/lib/pricing';

const ICONS: Record<string, React.ElementType> = {
  home: House,
  sparkles: Sparkles,
  window: PanelsTopLeft,
  grid: Grid3x3,
  droplet: Droplet,
  layers: Layers,
  box: Box,
};

export function Services({ services }: { services: CatalogService[] }) {
  const params = useSearchParams();
  const requested = params.get('s');
  const firstServiceId = services[0]?.id ?? 'residential';
  const initial =
    requested && services.some((s) => s.id === requested) ? requested : firstServiceId;
  const [active, setActive] = useState<string>(initial);
  const current = services.find((s) => s.id === active) ?? services[0];

  if (!current) {
    return null;
  }

  return (
    <section id="services" className="relative py-24 sm:py-28 lg:py-32">
      <div className="container-mg">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">What she does</span>
          <h1 className="h-display mt-5 text-balance text-4xl sm:text-5xl">
            Pick the job. See what&apos;s included.
          </h1>
          <p className="mt-5 text-pretty text-[17px] leading-relaxed text-espresso-900/65">
            Services priced honestly. Tap any card to see exactly what Katie
            does — no vague packages, no upsell surprises.
          </p>
        </div>

        {/* Pain points ticker */}
        <div className="mt-10">
          <PainMarquee />
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
          {/* Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {services.map((s, i) => {
              const Icon = ICONS[s.icon] ?? Sparkles;
              const isActive = s.id === active;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  aria-pressed={isActive}
                  className={`group relative overflow-hidden rounded-3xl border p-4 text-left
                              transition-all duration-300 sm:p-5 ${
                                isActive
                                  ? 'border-gold-400/50 bg-espresso-950 shadow-lift'
                                  : 'border-espresso-900/8 bg-white hover:border-gold-400/40 hover:shadow-lift-sm'
                              }`}
                >
                  {isActive && <span className="glow-wash absolute inset-0" />}
                  <div className="relative">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl
                                  transition-colors ${
                                    isActive
                                      ? 'bg-gold-400/20'
                                      : 'bg-gold-100 group-hover:bg-gold-200/60'
                                  }`}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] ${
                          isActive ? 'text-gold-300' : 'text-gold-600'
                        }`}
                        strokeWidth={2.2}
                      />
                    </div>
                    <p
                      className={`mt-3.5 text-[15px] font-semibold leading-tight ${
                        isActive ? 'text-cream-50' : 'text-espresso-950'
                      }`}
                    >
                      {s.name}
                    </p>
                    <p
                      className={`mt-1 text-[12.5px] ${
                        isActive ? 'text-cream-200/60' : 'text-espresso-900/50'
                      }`}
                    >
                      {s.short}
                    </p>
                    <p
                      className={`mt-3 text-[12px] font-semibold ${
                        isActive ? 'text-gold-300' : 'text-gold-600'
                      }`}
                    >
                      from {formatMoney(s.base)}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="card overflow-hidden p-7 sm:p-9"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="h-display text-3xl">{current.name}</h3>
                    <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-gold-600">
                      {current.short}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-cream-200 px-4 py-2.5 text-center">
                    <span className="block text-[10.5px] font-bold uppercase tracking-wider text-espresso-900/50">
                      Starting at
                    </span>
                    <span className="h-display text-2xl text-espresso-950">
                      {formatMoney(current.base)}
                    </span>
                  </div>
                </div>

                <p className="mt-5 text-pretty leading-relaxed text-espresso-900/70">
                  {current.description}
                </p>

                <div className="mt-7 border-t border-espresso-900/8 pt-6">
                  <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.14em] text-espresso-900/45">
                    Every visit includes
                  </p>
                  <ul className="space-y-2.5">
                    {current.includes.map((item, i) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.35 }}
                        className="flex items-start gap-3"
                      >
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center
                                     rounded-full bg-sage-600/15"
                        >
                          <Check className="h-3 w-3 text-sage-700" strokeWidth={3.5} />
                        </span>
                        <span className="text-[15px] text-espresso-900/80">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/book?service=${current.id}`}
                  className="btn-primary mt-8 w-full"
                >
                  <Plus className="h-4 w-4" />
                  Price this service
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
