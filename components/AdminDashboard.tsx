'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Camera,
  Trash2,
  X,
  Inbox,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { frequencies } from '@/lib/content';
import type { CatalogAddOn, CatalogService } from '@/lib/catalog-types';
import { formatMoney } from '@/lib/pricing';

export interface AdminBooking {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  serviceType: string;
  frequency: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number | null;
  addOns: string[];
  preferredDate: string | null;
  preferredTime: string | null;
  notes: string | null;
  estimateLow: number;
  estimateHigh: number;
  status: string;
  createdAt: string;
  photoIds: string[];
}

const STATUSES = [
  { id: 'new', label: 'New', tone: 'bg-gold-400 text-espresso-950' },
  { id: 'contacted', label: 'Contacted', tone: 'bg-sage-500 text-espresso-950' },
  { id: 'scheduled', label: 'Scheduled', tone: 'bg-sage-700 text-cream-50' },
  { id: 'completed', label: 'Completed', tone: 'bg-espresso-700 text-cream-50' },
  { id: 'archived', label: 'Archived', tone: 'bg-espresso-400 text-cream-50' },
];

const label = (id: string, list: { id: string; name?: string; label?: string }[]) =>
  list.find((x) => x.id === id)?.name ??
  list.find((x) => x.id === id)?.label ??
  id;

export function AdminDashboard({
  bookings: initial,
  services,
  addOns,
}: {
  bookings: AdminBooking[];
  services: CatalogService[];
  addOns: CatalogAddOn[];
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initial);
  const [filter, setFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AdminBooking | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const stats = useMemo(() => {
    const open = bookings.filter(
      (b) => b.status !== 'completed' && b.status !== 'archived'
    );
    const pipeline = open.reduce((sum, b) => sum + (b.estimateLow + b.estimateHigh) / 2, 0);
    return {
      total: bookings.length,
      newCount: bookings.filter((b) => b.status === 'new').length,
      open: open.length,
      pipeline: Math.round(pipeline),
    };
  }, [bookings]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (filter !== 'all' && b.status !== filter) return false;
      if (!q) return true;
      return [b.name, b.email, b.phone, b.city, b.reference, b.address]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [bookings, filter, query]);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, status } : b)));
      setSelected((s) => (s && s.id === id ? { ...s, status } : s));
    }
    setBusy(null);
  }

  async function remove(id: string) {
    if (!confirm('Delete this request and its photos? This cannot be undone.')) return;
    setBusy(id);
    const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setBookings((bs) => bs.filter((b) => b.id !== id));
      setSelected(null);
    }
    setBusy(null);
  }

  return (
    <>
      <main className="container-mg py-8">
        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'New requests', value: stats.newCount, icon: Inbox },
            { label: 'Open jobs', value: stats.open, icon: Calendar },
            { label: 'All time', value: stats.total, icon: ChevronRight },
            {
              label: 'Open pipeline',
              value: formatMoney(stats.pipeline),
              icon: DollarSign,
            },
          ].map((s) => (
            <div key={s.label} className="card p-5">
              <s.icon className="h-5 w-5 text-gold-600" />
              <p className="h-display mt-3 text-3xl tabular-nums">{s.value}</p>
              <p className="mt-0.5 text-[13px] text-espresso-900/50">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-900/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, town, reference…"
              className="field !pl-11"
            />
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {['all', ...STATUSES.map((s) => s.id)].map((id) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-[13px] font-semibold
                            transition-all ${
                              filter === id
                                ? 'border-espresso-900 bg-espresso-900 text-cream-50'
                                : 'border-espresso-900/12 bg-white text-espresso-900/65 hover:border-gold-400'
                            }`}
              >
                {id === 'all' ? 'All' : STATUSES.find((s) => s.id === id)?.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="mt-5 space-y-3">
          {visible.length === 0 && (
            <div className="card p-12 text-center">
              <Inbox className="mx-auto h-8 w-8 text-espresso-900/25" />
              <p className="mt-4 text-espresso-900/55">
                {bookings.length === 0
                  ? 'No booking requests yet. They will show up here the moment someone submits the form.'
                  : 'Nothing matches that filter.'}
              </p>
            </div>
          )}

          {visible.map((b) => {
            const st = STATUSES.find((s) => s.id === b.status) ?? STATUSES[0];
            return (
              <motion.button
                key={b.id}
                layout
                onClick={() => setSelected(b)}
                className="card w-full p-5 text-left hover:shadow-lift"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="h-display text-xl">{b.name}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${st.tone}`}
                      >
                        {st.label}
                      </span>
                      {b.photoIds.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-1 text-[11px] font-semibold text-gold-700">
                          <Camera className="h-3 w-3" />
                          {b.photoIds.length}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[14px] text-espresso-900/60">
                      {label(b.serviceType, services)} ·{' '}
                      {label(b.frequency, [...frequencies])} · {b.city}
                    </p>
                    <p className="mt-1 text-[12.5px] text-espresso-900/40">
                      {b.reference} ·{' '}
                      {new Date(b.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="h-display text-2xl tabular-nums">
                      {formatMoney(b.estimateLow)}–{formatMoney(b.estimateHigh)}
                    </p>
                    <p className="text-[12px] text-espresso-900/40">estimate</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <div
              className="absolute inset-0 bg-espresso-950/40 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              className="absolute inset-y-0 right-0 w-full max-w-lg overflow-y-auto bg-cream-100 shadow-2xl"
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-espresso-900/10 bg-cream-100/95 px-6 py-4 backdrop-blur">
                <div>
                  <p className="h-display text-2xl">{selected.name}</p>
                  <p className="text-[12.5px] text-espresso-900/45">
                    {selected.reference}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                  className="rounded-full border border-espresso-900/12 bg-white p-2.5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-6">
                {/* Status */}
                <div>
                  <p className="label">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s.id}
                        disabled={busy === selected.id}
                        onClick={() => setStatus(selected.id, s.id)}
                        className={`rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-all ${
                          selected.status === s.id
                            ? s.tone
                            : 'bg-white text-espresso-900/55 hover:bg-cream-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="card p-5">
                  <p className="label !mb-3">Contact</p>
                  <div className="space-y-2.5">
                    <a
                      href={`tel:${selected.phone}`}
                      className="flex items-center gap-2.5 text-[14.5px] text-espresso-900/75 hover:text-gold-600"
                    >
                      <Phone className="h-4 w-4 text-gold-600" />
                      {selected.phone}
                    </a>
                    <a
                      href={`mailto:${selected.email}`}
                      className="flex items-center gap-2.5 break-all text-[14.5px] text-espresso-900/75 hover:text-gold-600"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-gold-600" />
                      {selected.email}
                    </a>
                    <p className="flex items-start gap-2.5 text-[14.5px] text-espresso-900/75">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                      {selected.address}, {selected.city} {selected.zip}
                    </p>
                  </div>
                </div>

                {/* Job */}
                <div className="card p-5">
                  <p className="label !mb-3">The job</p>
                  <dl className="grid grid-cols-2 gap-3 text-[14px]">
                    <div>
                      <dt className="text-espresso-900/45">Service</dt>
                      <dd className="font-semibold">
                        {label(selected.serviceType, services)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-espresso-900/45">Frequency</dt>
                      <dd className="font-semibold">
                        {label(selected.frequency, [...frequencies])}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-espresso-900/45">Bed / bath</dt>
                      <dd className="font-semibold">
                        {selected.bedrooms} / {selected.bathrooms}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-espresso-900/45">Square feet</dt>
                      <dd className="font-semibold">{selected.sqft ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-espresso-900/45">Preferred date</dt>
                      <dd className="font-semibold">
                        {selected.preferredDate || 'Flexible'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-espresso-900/45">Time of day</dt>
                      <dd className="font-semibold capitalize">
                        {selected.preferredTime || 'Flexible'}
                      </dd>
                    </div>
                  </dl>

                  {selected.addOns.length > 0 && (
                    <div className="mt-4 border-t border-espresso-900/8 pt-4">
                      <p className="text-[12px] text-espresso-900/45">Add-ons</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {selected.addOns.map((a) => (
                          <span
                            key={a}
                            className="rounded-full bg-gold-100 px-2.5 py-1 text-[12px] font-medium text-gold-700"
                          >
                            {label(a, addOns)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-baseline justify-between border-t border-espresso-900/8 pt-4">
                    <span className="text-[13px] text-espresso-900/45">
                      Quoted estimate
                    </span>
                    <span className="h-display text-2xl">
                      {formatMoney(selected.estimateLow)}–
                      {formatMoney(selected.estimateHigh)}
                    </span>
                  </div>
                </div>

                {selected.notes && (
                  <div className="card p-5">
                    <p className="label !mb-2">Their notes</p>
                    <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-espresso-900/75">
                      {selected.notes}
                    </p>
                  </div>
                )}

                {/* Photos */}
                {selected.photoIds.length > 0 && (
                  <div className="card p-5">
                    <p className="label !mb-3">
                      Photos of the space ({selected.photoIds.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selected.photoIds.map((pid) => (
                        <a
                          key={pid}
                          href={`/api/photos/${pid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-square overflow-hidden rounded-xl border border-espresso-900/10"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/photos/${pid}`}
                            alt="Customer-submitted photo"
                            className="h-full w-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                    <p className="mt-3 text-[12px] text-espresso-900/40">
                      Private — only visible to you while signed in.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => remove(selected.id)}
                  disabled={busy === selected.id}
                  className="btn w-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete request
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
