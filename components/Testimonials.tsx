'use client';

import { motion } from 'framer-motion';
import { Quote, Star, Facebook } from 'lucide-react';
import { business } from '@/lib/content';

export interface Review {
  id: string;
  author: string;
  body: string;
  source: string;
}

export function Testimonials({ reviews }: { reviews: Review[] }) {
  return (
    <section id="reviews" className="relative overflow-hidden py-24 sm:py-28">
      <div className="container-mg">
        <div className="relative overflow-hidden rounded-5xl bg-espresso-950 p-2">
          <div className="glow-wash rounded-[2.25rem] px-6 py-16 sm:px-12 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <span
                className="inline-flex items-center gap-2 rounded-full border border-gold-400/25
                           bg-gold-400/10 px-3.5 py-1.5 text-[11px] font-bold uppercase
                           tracking-[0.14em] text-gold-300"
              >
                <Star className="h-3 w-3 fill-gold-300" />
                What people say
              </span>
              <h2 className="h-display mt-5 text-balance text-4xl text-cream-50 sm:text-5xl">
                {business.motto}
              </h2>
            </div>

            {reviews.length > 0 ? (
              <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reviews.map((r, i) => (
                  <motion.figure
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
                  >
                    <Quote className="h-6 w-6 text-gold-400/70" />
                    <blockquote className="mt-4 text-pretty leading-relaxed text-cream-100/85">
                      {r.body}
                    </blockquote>
                    <figcaption className="mt-5 flex items-center gap-2.5 border-t border-white/10 pt-4">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full
                                   bg-gold-400/15 text-[13px] font-bold text-gold-300"
                      >
                        {r.author.slice(0, 1)}
                      </span>
                      <span>
                        <span className="block text-[14px] font-semibold text-cream-50">
                          {r.author}
                        </span>
                        {r.source === 'facebook' && (
                          <span className="flex items-center gap-1 text-[11.5px] text-cream-200/45">
                            <Facebook className="h-3 w-3" />
                            via Facebook
                          </span>
                        )}
                      </span>
                    </figcaption>
                  </motion.figure>
                ))}
              </div>
            ) : (
              <p className="mt-10 text-center text-cream-200/50">
                Reviews will appear here as they come in.
              </p>
            )}

            <div className="mt-12 text-center">
              <a
                href={business.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost !border-white/15 !bg-white/5 !text-cream-50 hover:!bg-white/10"
              >
                <Facebook className="h-4 w-4" />
                Read more on Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
