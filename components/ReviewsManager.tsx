'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Facebook,
  MessageSquareQuote,
  Loader2,
  X,
} from 'lucide-react';

export interface AdminReview {
  id: string;
  author: string;
  body: string;
  source: string;
  featured: boolean;
  order: number;
  createdAt: string;
}

export function ReviewsManager({ reviews: initial }: { reviews: AdminReview[] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ author: '', body: '', source: 'direct' });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy('new');
    setError(null);

    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...draft, featured: true, order: reviews.length }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? 'Could not save that review.');
      setBusy(null);
      return;
    }

    setReviews((r) => [...r, data.review]);
    setDraft({ author: '', body: '', source: 'direct' });
    setAdding(false);
    setBusy(null);
    router.refresh();
  }

  async function toggleFeatured(r: AdminReview) {
    setBusy(r.id);
    const res = await fetch(`/api/testimonials/${r.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !r.featured }),
    });
    if (res.ok) {
      setReviews((rs) =>
        rs.map((x) => (x.id === r.id ? { ...x, featured: !x.featured } : x))
      );
      router.refresh();
    }
    setBusy(null);
  }

  async function remove(id: string) {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    setBusy(id);
    const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setReviews((rs) => rs.filter((x) => x.id !== id));
      router.refresh();
    }
    setBusy(null);
  }

  return (
    <main className="container-mg py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h-display text-3xl">Reviews</h1>
          <p className="mt-1.5 text-[14px] text-espresso-900/55">
            Anything marked visible shows on the home and About pages.
          </p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-maple !py-2.5 !text-[13.5px]">
          <Plus className="h-4 w-4" />
          Add a review
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="card mt-6 p-12 text-center">
          <MessageSquareQuote className="mx-auto h-8 w-8 text-espresso-900/25" />
          <p className="mt-4 text-espresso-900/55">
            No reviews yet. Add one from a text, an email, or a Facebook comment.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <motion.div key={r.id} layout className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-espresso-950">
                    {r.author}
                  </p>
                  {r.source === 'facebook' && (
                    <span className="mt-0.5 inline-flex items-center gap-1 text-[11.5px] text-espresso-900/45">
                      <Facebook className="h-3 w-3" />
                      via Facebook
                    </span>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    r.featured
                      ? 'bg-sage-500 text-espresso-950'
                      : 'bg-espresso-900/10 text-espresso-900/50'
                  }`}
                >
                  {r.featured ? 'Visible' : 'Hidden'}
                </span>
              </div>

              <p className="mt-3 flex-1 text-pretty text-[14px] leading-relaxed text-espresso-900/70">
                {r.body}
              </p>

              <div className="mt-4 flex gap-2 border-t border-espresso-900/8 pt-4">
                <button
                  onClick={() => toggleFeatured(r)}
                  disabled={busy === r.id}
                  className="btn-ghost flex-1 !px-3 !py-2 !text-[12.5px]"
                >
                  {r.featured ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      Show
                    </>
                  )}
                </button>
                <button
                  onClick={() => remove(r.id)}
                  disabled={busy === r.id}
                  aria-label="Delete review"
                  className="btn border border-red-200 bg-red-50 !px-3 !py-2 text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add dialog */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-5"
          >
            <div
              className="absolute inset-0 bg-espresso-950/40 backdrop-blur-sm"
              onClick={() => setAdding(false)}
            />
            <motion.form
              onSubmit={create}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card relative w-full max-w-lg p-7"
            >
              <div className="flex items-center justify-between">
                <h2 className="h-display text-2xl">Add a review</h2>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  aria-label="Close"
                  className="rounded-full border border-espresso-900/12 bg-white p-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="author" className="label">Their name</label>
                  <input
                    id="author"
                    required
                    value={draft.author}
                    onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                    className="field"
                    placeholder="Shawn S."
                  />
                </div>
                <div>
                  <label htmlFor="body" className="label">What they said</label>
                  <textarea
                    id="body"
                    required
                    rows={4}
                    value={draft.body}
                    onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                    className="field resize-none"
                    placeholder="Katie did an amazing job on our kitchen…"
                  />
                </div>
                <div>
                  <label htmlFor="source" className="label">Where it came from</label>
                  <select
                    id="source"
                    value={draft.source}
                    onChange={(e) => setDraft({ ...draft, source: e.target.value })}
                    className="field"
                  >
                    <option value="direct">Text, email, or in person</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
                  {error}
                </p>
              )}

              <p className="mt-5 text-[12.5px] leading-relaxed text-espresso-900/45">
                Make sure the person is okay with their words and name appearing
                publicly before you publish it.
              </p>

              <button
                type="submit"
                disabled={busy === 'new'}
                className="btn-primary mt-5 w-full"
              >
                {busy === 'new' && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy === 'new' ? 'Saving…' : 'Save review'}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
