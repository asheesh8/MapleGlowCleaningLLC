import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Clock, ArrowRight } from 'lucide-react';
import { business } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Call, text, or email Maple Glow Cleaning LLC — owner-operated cleaning serving all of Vermont.',
};

const channels = [
  {
    icon: Phone,
    label: 'Call or text',
    value: business.phone.replace('+1 ', ''),
    href: business.phoneHref,
    note: 'Fastest way to reach Katie',
  },
  {
    icon: Mail,
    label: 'Email',
    value: business.email,
    href: `mailto:${business.email}`,
    note: 'Good for detailed questions',
  },
  {
    icon: Facebook,
    label: 'Facebook',
    value: 'Maple Glow Cleaning LLC',
    href: business.facebook,
    note: 'Photos from recent jobs',
  },
];

export default function ContactPage() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="glow-wash absolute inset-0 -z-10 opacity-70" />
      <div className="container-mg">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Get in touch</span>
          <h1 className="h-display mt-5 text-balance text-4xl sm:text-5xl">
            Let&apos;s get your place glowing.
          </h1>
          <p className="mt-5 text-pretty text-[17px] leading-relaxed text-espresso-900/65">
            Katie answers every message herself, usually within 24 hours.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="card group p-6 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-100
                               transition-colors group-hover:bg-gold-200/70">
                <c.icon className="h-5 w-5 text-gold-600" strokeWidth={2.2} />
              </span>
              <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.14em] text-espresso-900/45">
                {c.label}
              </p>
              <p className="mt-1 break-words text-[15.5px] font-semibold text-espresso-950">
                {c.value}
              </p>
              <p className="mt-1.5 text-[13px] text-espresso-900/50">{c.note}</p>
            </a>
          ))}
        </div>

        <div className="mx-auto mt-4 grid max-w-4xl gap-4 sm:grid-cols-2">
          <div className="card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-200">
              <MapPin className="h-5 w-5 text-sage-700" strokeWidth={2.2} />
            </span>
            <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.14em] text-espresso-900/45">
              Service area
            </p>
            <p className="mt-1 text-[15.5px] font-semibold text-espresso-950">
              All of Vermont
            </p>
            <p className="mt-1.5 text-[13px] text-espresso-900/50">
              Homes, rentals, and small commercial spaces
            </p>
          </div>

          <div className="card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-200">
              <Clock className="h-5 w-5 text-sage-700" strokeWidth={2.2} />
            </span>
            <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.14em] text-espresso-900/45">
              Availability
            </p>
            <p className="mt-1 text-[15.5px] font-semibold text-espresso-950">
              Flexible scheduling
            </p>
            <p className="mt-1.5 text-[13px] text-espresso-900/50">
              Evenings and weekends available on request
            </p>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <Link
            href="/book"
            className="btn-maple group w-full !py-4 text-[15px]"
          >
            Or get an instant estimate first
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
