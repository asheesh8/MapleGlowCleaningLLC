'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  DollarSign,
  LayoutDashboard,
  MessageSquareQuote,
  MessageCircle,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { Logo } from './Logo';

const tabs = [
  { href: '/admin', label: 'Bookings', icon: LayoutDashboard },
  { href: '/admin/chat', label: 'Chats', icon: MessageCircle },
  { href: '/admin/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquareQuote },
];

export function AdminShell({
  children,
  adminName,
}: {
  children: React.ReactNode;
  adminName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="sticky top-0 z-40 border-b border-espresso-900/10 bg-cream-100/90 backdrop-blur-xl">
        <div className="container-mg flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden text-[13px] text-espresso-900/45 sm:block">
              Signed in as {adminName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" className="btn-ghost !px-4 !py-2.5 !text-[13px]">
              <ExternalLink className="h-4 w-4" />
              View site
            </Link>
            <button onClick={logout} className="btn-ghost !px-4 !py-2.5 !text-[13px]">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>

        <div className="container-mg flex gap-1 pb-2">
          {tabs.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px]
                            font-semibold transition-colors ${
                              active
                                ? 'bg-espresso-950 text-cream-50'
                                : 'text-espresso-900/60 hover:bg-white'
                            }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </header>

      {children}
    </div>
  );
}
