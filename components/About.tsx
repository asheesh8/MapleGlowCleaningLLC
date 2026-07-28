'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Quote, ShieldCheck, Heart, CalendarClock } from 'lucide-react';
import { ownerBio, business } from '@/lib/content';

const stats = [
  { icon: ShieldCheck, value: 'Insured', label: 'Licensed Vermont LLC' },
  { icon: Heart, value: 'Solo operator', label: 'Katie at every visit' },
  { icon: CalendarClock, value: 'Flexible', label: 'Evenings & weekends' },
];

export function About() {
  return (
    <section id="about" className="relative py-24 sm:py-28 lg:py-32">
      <div className="container-mg">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-5xl bg-espresso-950">
              <Image
                src="/katie.jpg"
                alt="Katie Proper, owner of Maple Glow Cleaning"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-center"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute -bottom-5 -right-3 rounded-3xl bg-gradient-to-br
                         from-gold-300 to-gold-500 px-6 py-4 shadow-glow sm:-right-6"
            >
              <span className="h-display block text-2xl text-espresso-950">Vermont</span>
              <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-espresso-950/60">
                Born &amp; based
              </span>
            </motion.div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <span className="eyebrow">Meet the owner</span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-display mt-5 text-balance text-4xl sm:text-5xl"
            >
              {ownerBio.greeting}
            </motion.h2>

            <div className="mt-6 space-y-4">
              {ownerBio.body.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.55 }}
                  className="text-pretty leading-relaxed text-espresso-900/70"
                >
                  {p}
                </motion.p>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 border-l-2 border-gold-400 pl-5">
              <Quote className="h-5 w-5 shrink-0 text-gold-500" />
              <p className="h-display text-lg text-espresso-950">{ownerBio.signature}</p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {stats.map((s, i) => (
                <motion.div
                  key={s.value}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
                  className="rounded-3xl border border-espresso-900/8 bg-white p-5"
                >
                  <s.icon className="h-5 w-5 text-gold-600" strokeWidth={2.2} />
                  <p className="h-display mt-3 text-xl text-espresso-950">{s.value}</p>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-espresso-900/50">
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </div>

            <a
              href={business.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost mt-8"
            >
              See her work on Facebook
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
