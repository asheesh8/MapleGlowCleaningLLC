import { Phone, Mail, MapPin, Facebook } from 'lucide-react';
import { Logo } from './Logo';
import { business, services } from '@/lib/content';

export function Footer() {
  return (
    <footer className="border-t border-espresso-900/10 bg-cream-200/50">
      <div className="container-mg py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-pretty leading-relaxed text-espresso-900/60">
              {business.slogan} Owner-operated, fully insured cleaning across
              Vermont — with Katie at every visit.
            </p>
            <a
              href={business.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border
                         border-espresso-900/12 bg-white px-4 py-2.5 text-[13.5px]
                         font-semibold text-espresso-900 transition-colors hover:border-gold-400"
            >
              <Facebook className="h-4 w-4" />
              Follow on Facebook
            </a>
          </div>

          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-espresso-900/45">
              Services
            </h3>
            <ul className="mt-5 space-y-2.5">
              {services.map((s) => (
                <li key={s.id}>
                  <a
                    href="#services"
                    className="text-[14.5px] text-espresso-900/70 transition-colors hover:text-gold-600"
                  >
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-espresso-900/45">
              Get in touch
            </h3>
            <ul className="mt-5 space-y-3.5">
              <li>
                <a
                  href={business.phoneHref}
                  className="flex items-start gap-2.5 text-[14.5px] text-espresso-900/70
                             transition-colors hover:text-gold-600"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                  {business.phone.replace('+1 ', '')}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-start gap-2.5 break-all text-[14.5px]
                             text-espresso-900/70 transition-colors hover:text-gold-600"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                  {business.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-[14.5px] text-espresso-900/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                Serving all of Vermont
              </li>
            </ul>

            <a href="#book" className="btn-maple mt-7 w-full !py-3 text-[14px]">
              Get an instant quote
            </a>
          </div>
        </div>

        <div
          className="mt-14 flex flex-col items-center justify-between gap-4 border-t
                     border-espresso-900/10 pt-8 sm:flex-row"
        >
          <p className="text-[13px] text-espresso-900/45">
            © {new Date().getFullYear()} {business.legalName}. Fully insured for
            your peace of mind.
          </p>
          <a
            href="/admin"
            className="text-[13px] text-espresso-900/35 transition-colors hover:text-gold-600"
          >
            Owner login
          </a>
        </div>
      </div>
    </footer>
  );
}
