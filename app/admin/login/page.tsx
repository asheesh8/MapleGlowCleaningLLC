'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { Logo } from '@/components/Logo';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? 'Sign in failed.');
      setBusy(false);
      return;
    }

    const next = params.get('next') || '/admin';
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card w-full max-w-md p-8 sm:p-10">
      <div className="flex justify-center">
        <Logo />
      </div>

      <div className="mt-8 text-center">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-100">
          <Lock className="h-5 w-5 text-gold-600" />
        </span>
        <h1 className="h-display mt-4 text-2xl">Owner sign in</h1>
        <p className="mt-2 text-[14px] text-espresso-900/55">
          Bookings, photos, and requests — all in one place.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            placeholder="you@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-primary mt-7 w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {busy ? 'Signing in…' : 'Sign in'}
      </button>

      <a
        href="/"
        className="mt-5 block text-center text-[13px] text-espresso-900/45 hover:text-gold-600"
      >
        ← Back to the site
      </a>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="glow-wash flex min-h-screen items-center justify-center p-5">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
