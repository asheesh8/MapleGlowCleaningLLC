'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  House,
  Box,
  Grid3x3,
  Droplet,
  Layers,
  PanelsTopLeft,
  ArrowRight,
} from 'lucide-react';
import type { CatalogService } from '@/lib/catalog-types';
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

/** Compact services grid for the home page — full detail lives on /services. */
export function ServicesPreview({ services }: { services: CatalogService[] }) {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-mg">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">What she does</span>
          <h2 className="h-display mt-5 text-balance text-3xl sm:text-4xl">
            Services, priced honestly.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-espresso-900/65">
            No vague packages and no upsell surprises — just the work you asked
            for, done properly.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => {
            const Icon = ICONS[s.icon] ?? Sparkles;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
              >
                <Link
                  href={`/services?s=${s.id}`}
                  className="card group flex h-full flex-col p-5 hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100
                                   transition-colors group-hover:bg-gold-200/70">
                    <Icon className="h-[18px] w-[18px] text-gold-600" strokeWidth={2.2} />
                  </span>
                  <p className="mt-3.5 text-[15px] font-semibold leading-tight text-espresso-950">
                    {s.name}
                  </p>
                  <p className="mt-1 text-[13px] text-espresso-900/55">{s.short}</p>
                  <p className="mt-auto pt-3 text-[12.5px] font-semibold text-gold-600">
                    from {formatMoney(s.base)}
                  </p>
                </Link>
              </motion.div>
            );
          })}

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: 0.35 }}
          >
            <Link
              href="/book"
              className="group flex h-full flex-col justify-between rounded-4xl bg-espresso-950 p-5
                         shadow-lift transition-transform hover:-translate-y-1"
            >
              <span className="glow-wash absolute inset-0 rounded-4xl opacity-0" />
              <p className="h-display text-xl text-cream-50">
                Not sure which one?
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-cream-200/60">
                Answer four questions and see your price instantly.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-[13.5px] font-semibold text-gold-300">
                Get an estimate
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
