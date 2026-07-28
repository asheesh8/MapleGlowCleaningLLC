'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import { Logo } from './Logo';
import { business } from '@/lib/content';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Her Work' },
  { href: '/about', label: 'About Katie' },
  { href: '/contact', label: 'Contact' },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile sheet whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-espresso-900/10 bg-cream-100/90 py-2.5 backdrop-blur-xl'
            : 'py-4'
        }`}
      >
        <nav className="container-mg flex items-center justify-between gap-4">
          <Link href="/" aria-label="Maple Glow Cleaning home">
            <Logo />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative rounded-full px-4 py-2 text-[14px] font-medium
                              transition-colors ${
                                active
                                  ? 'text-espresso-950'
                                  : 'text-espresso-900/65 hover:text-espresso-950'
                              }`}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-500"
                      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={business.phoneHref}
              className="hidden items-center gap-2 rounded-full border border-espresso-900/12
                         px-4 py-2.5 text-[13.5px] font-semibold text-espresso-900
                         transition-colors hover:bg-white sm:inline-flex"
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={2.5} />
              {business.phone.replace('+1 ', '')}
            </a>

            <Link href="/book" className="btn-maple hidden !px-5 !py-2.5 sm:inline-flex">
              Get a quote
            </Link>

            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="rounded-full border border-espresso-900/12 bg-white/70 p-2.5 lg:hidden"
            >
              <Menu className="h-5 w-5 text-espresso-900" />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div
              className="absolute inset-0 bg-espresso-950/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col
                         bg-cream-100 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="rounded-full border border-espresso-900/12 bg-white p-2.5"
                >
                  <X className="h-5 w-5 text-espresso-900" />
                </button>
              </div>

              <div className="mt-10 flex flex-col gap-1">
                {links.map((l, i) => (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.06 }}
                  >
                    <Link
                      href={l.href}
                      className={`h-display block border-b border-espresso-900/8 py-4 text-2xl ${
                        pathname === l.href ? 'text-gold-600' : 'text-espresso-950'
                      }`}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <Link href="/book" className="btn-maple w-full">
                  Get an instant quote
                </Link>
                <a href={business.phoneHref} className="btn-ghost w-full">
                  <Phone className="h-4 w-4" />
                  {business.phone}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
