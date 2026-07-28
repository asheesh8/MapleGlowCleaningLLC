import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { business } from '@/lib/content';

export function CtaBand() {
  return (
    <section className="pb-24 pt-4 sm:pb-28">
      <div className="container-mg">
        <div className="overflow-hidden rounded-5xl bg-gradient-to-br from-gold-300 to-gold-500 p-2">
          <div className="rounded-[2.25rem] px-7 py-14 text-center sm:px-12">
            <h2 className="h-display text-balance text-3xl text-espresso-950 sm:text-4xl">
              Ready for a home that feels handled?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-espresso-950/70">
              Get a real number in about a minute — no card, no obligation, and
              a reply from Katie within 24 hours.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/book"
                className="btn group bg-espresso-950 text-cream-50 hover:bg-espresso-800"
              >
                Get my instant quote
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href={business.phoneHref}
                className="btn border border-espresso-950/20 bg-white/40 text-espresso-950 hover:bg-white/70"
              >
                <Phone className="h-4 w-4" />
                {business.phone.replace('+1 ', '')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
