'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ImagePlus,
  Loader2,
  Minus,
  Plus,
  Trash2,
  PartyPopper,
  Info,
} from 'lucide-react';
import {
  frequencies,
  business,
} from '@/lib/content';
import type { CatalogAddOn, CatalogService } from '@/lib/catalog-types';
import { calculateQuote, formatMoney } from '@/lib/pricing';
import { MAX_PHOTOS, MAX_UPLOAD_BYTES } from '@/lib/validation';

const STEPS = [
  { id: 'service', label: 'Service' },
  { id: 'space', label: 'Your space' },
  { id: 'photos', label: 'Photos' },
  { id: 'contact', label: 'Details' },
];

interface Photo {
  file: File;
  url: string;
  id: string;
}

interface FormState {
  serviceType: string;
  frequency: string;
  bedrooms: number;
  bathrooms: number;
  sqft: string;
  addOns: string[];
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

const makeInitial = (serviceType: string): FormState => ({
  serviceType,
  frequency: 'once',
  bedrooms: 3,
  bathrooms: 2,
  sqft: '',
  addOns: [],
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zip: '',
  preferredDate: '',
  preferredTime: 'flexible',
  notes: '',
});

/** Small +/- stepper used for bedroom & bathroom counts. */
function Counter({
  label,
  value,
  onChange,
  min = 0,
  max = 12,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="rounded-2xl border border-espresso-900/10 bg-cream-50 p-4">
      <span className="text-[13px] font-semibold text-espresso-900/70">{label}</span>
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border
                     border-espresso-900/12 bg-white transition-all hover:border-gold-400
                     active:scale-90 disabled:opacity-30"
        >
          <Minus className="h-4 w-4 text-espresso-900" strokeWidth={2.5} />
        </button>
        <motion.span
          key={value}
          initial={{ scale: 0.7, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 400 }}
          className="h-display text-3xl tabular-nums text-espresso-950"
        >
          {value}
        </motion.span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border
                     border-espresso-900/12 bg-white transition-all hover:border-gold-400
                     active:scale-90 disabled:opacity-30"
        >
          <Plus className="h-4 w-4 text-espresso-900" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export function BookingWizard({
  services,
  addOns,
}: {
  services: CatalogService[];
  addOns: CatalogAddOn[];
}) {
  const reduce = useReducedMotion();
  const params = useSearchParams();
  const requested = params.get('service');
  const firstServiceId = services[0]?.id ?? 'residential';
  const preselected =
    requested && services.some((s) => s.id === requested) ? requested : null;

  const [step, setStep] = useState(preselected ? 1 : 0);
  const [form, setForm] = useState<FormState>(
    () => makeInitial(preselected ?? firstServiceId)
  );
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    reference: string;
    low: number;
    high: number;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const photosRef = useRef<Photo[]>([]);

  photosRef.current = photos;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  };

  // Revoke object URLs on unmount so previews don't leak memory.
  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, []);

  const quote = useMemo(
    () =>
      calculateQuote({
        serviceType: form.serviceType,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        frequency: form.frequency,
        addOns: form.addOns,
      }, { services, addOns, frequencies }),
    [
      form.serviceType,
      form.bedrooms,
      form.bathrooms,
      form.frequency,
      form.addOns,
      services,
      addOns,
    ]
  );

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const accepted: Photo[] = [];
    const problems: string[] = [];

    Array.from(incoming).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        problems.push(`${file.name} isn't an image`);
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        problems.push(`${file.name} is over 8 MB`);
        return;
      }
      accepted.push({
        file,
        url: URL.createObjectURL(file),
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      });
    });

    setPhotos((prev) => {
      const room = MAX_PHOTOS - prev.length;
      if (accepted.length > room) {
        problems.push(`Only ${MAX_PHOTOS} photos max`);
        accepted.slice(room).forEach((p) => URL.revokeObjectURL(p.url));
      }
      return [...prev, ...accepted.slice(0, room)];
    });

    setErrors((e) => ({ ...e, photos: problems.join(' · ') }));
  }, []);

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  function validateStep(index: number): boolean {
    const e: Record<string, string> = {};
    if (index === 3) {
      if (form.name.trim().length < 2) e.name = 'Please enter your name';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()))
        e.email = 'Please enter a valid email';
      if (form.phone.trim().length < 7) e.phone = 'Please enter a phone number';
      if (form.address.trim().length < 3) e.address = 'Please enter the street address';
      if (form.city.trim().length < 2) e.city = 'Please enter the town or city';
      if (!/^\d{5}(-\d{4})?$/.test(form.zip.trim())) e.zip = 'Enter a 5-digit ZIP';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const goTo = (next: number) => {
    setStep(next);
    requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  };

  const next = () => {
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) goTo(step + 1);
  };

  async function submit() {
    if (!validateStep(3)) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const fd = new FormData();
      fd.append(
        'payload',
        JSON.stringify({
          ...form,
          sqft: form.sqft ? Number(form.sqft) : null,
          preferredDate: form.preferredDate || null,
          preferredTime: form.preferredTime || null,
          notes: form.notes || null,
        })
      );
      photos.forEach((p) => fd.append('photos', p.file));

      const res = await fetch('/api/bookings', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? 'Something went wrong.');
        if (data.fields) {
          const flat: Record<string, string> = {};
          Object.entries(data.fields).forEach(([k, v]) => {
            flat[k] = Array.isArray(v) ? String(v[0]) : String(v);
          });
          setErrors(flat);
        }
        setSubmitting(false);
        return;
      }

      photos.forEach((p) => URL.revokeObjectURL(p.url));
      setPhotos([]);
      setResult({
        reference: data.reference,
        low: data.estimateLow,
        high: data.estimateHigh,
      });
    } catch {
      setSubmitError('We could not reach the server. Please call or text instead.');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Confirmation ── */
  if (result) {
    return (
      <section id="book" ref={sectionRef} className="scroll-mt-24 py-24 sm:py-28">
        <div className="container-mg">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-2xl overflow-hidden rounded-5xl bg-espresso-950 p-2 shadow-lift"
          >
            <div className="glow-wash rounded-[2.25rem] px-7 py-14 text-center sm:px-12">
              <motion.div
                initial={{ scale: 0, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 220, delay: 0.15 }}
                className="mx-auto flex h-20 w-20 items-center justify-center
                           rounded-full bg-gold-400/20"
              >
                <PartyPopper className="h-9 w-9 text-gold-300" strokeWidth={2} />
              </motion.div>

              <h2 className="h-display mt-7 text-4xl text-cream-50">Request received!</h2>
              <p className="mt-4 text-pretty leading-relaxed text-cream-200/70">
                Katie will reach out within 24 hours to confirm the details and
                lock in your date.
              </p>

              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-gold-200/60">
                    Your reference
                  </span>
                  <span className="h-display text-2xl text-cream-50">
                    {result.reference}
                  </span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-gold-200/60">
                    Estimate range
                  </span>
                  <span className="h-display text-2xl text-cream-50">
                    {formatMoney(result.low)}–{formatMoney(result.high)}
                  </span>
                </div>
              </div>

              <p className="mt-7 text-[13.5px] text-cream-200/50">
                Questions before then? Call or text{' '}
                <a
                  href={business.phoneHref}
                  className="font-semibold text-gold-300 underline underline-offset-4"
                >
                  {business.phone.replace('+1 ', '')}
                </a>
              </p>

              <button
                onClick={() => {
                  setResult(null);
                  setForm(makeInitial(firstServiceId));
                  setStep(0);
                }}
                className="btn-ghost mt-8 !border-white/15 !bg-white/10 !text-cream-50 hover:!bg-white/20"
              >
                Book another clean
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  const currentService = services.find((s) => s.id === form.serviceType) ?? services[0];

  if (!currentService) {
    return null;
  }

  return (
    <section
      id="book"
      ref={sectionRef}
      className="relative scroll-mt-24 overflow-hidden py-24 sm:py-28 lg:py-32"
    >
      <div className="glow-wash absolute inset-0 -z-10 opacity-70" />

      <div className="container-mg">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Instant estimate</span>
          <h1 className="h-display mt-5 text-balance text-4xl sm:text-5xl">
            Know the price before you call.
          </h1>
          <p className="mt-5 text-pretty text-[17px] leading-relaxed text-espresso-900/65">
            Answer four quick questions and watch your estimate update live. Add
            photos of the space and Katie can tighten the number before she even
            arrives.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)] lg:gap-8">
          {/* ── Wizard ── */}
          <div className="card overflow-hidden">
            {/* Progress */}
            <div className="border-b border-espresso-900/8 bg-cream-50/80 px-5 py-5 sm:px-8">
              <div className="flex items-center gap-2 sm:gap-3">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="flex flex-1 items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => i < step && goTo(i)}
                      disabled={i > step}
                      className="flex items-center gap-2.5 rounded-full disabled:cursor-default"
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center
                                    rounded-full text-[13px] font-bold transition-all ${
                                      i < step
                                        ? 'bg-sage-600 text-cream-50'
                                        : i === step
                                          ? 'bg-gradient-to-br from-gold-300 to-gold-500 text-espresso-950 shadow-glow'
                                          : 'bg-espresso-900/8 text-espresso-900/40'
                                    }`}
                      >
                        {i < step ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                      </span>
                      <span
                        className={`hidden text-[13.5px] font-semibold sm:block ${
                          i === step ? 'text-espresso-950' : 'text-espresso-900/45'
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <span className="h-px flex-1 bg-espresso-900/10" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-7 sm:px-8 sm:py-9">
              <AnimatePresence mode="wait">
                {/* ── Step 1: service ── */}
                {step === 0 && (
                  <motion.div
                    key="service"
                    initial={{ opacity: 0, x: reduce ? 0 : 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduce ? 0 : -24 }}
                    transition={{ duration: 0.28 }}
                  >
                    <h3 className="h-display text-2xl">What do you need done?</h3>
                    <p className="mt-2 text-[14.5px] text-espresso-900/55">
                      Not sure? Pick the closest — Katie will confirm.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {services.map((s) => {
                        const on = form.serviceType === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => set('serviceType', s.id)}
                            aria-pressed={on}
                            className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                              on
                                ? 'border-gold-400 bg-gold-100/60 shadow-glow'
                                : 'border-espresso-900/10 bg-cream-50 hover:border-gold-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[15px] font-semibold text-espresso-950">
                                {s.name}
                              </span>
                              {on && (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500">
                                  <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-[13px] text-espresso-900/55">{s.short}</p>
                            <p className="mt-2.5 text-[12.5px] font-semibold text-gold-600">
                              from {formatMoney(s.base)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2: space ── */}
                {step === 1 && (
                  <motion.div
                    key="space"
                    initial={{ opacity: 0, x: reduce ? 0 : 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduce ? 0 : -24 }}
                    transition={{ duration: 0.28 }}
                  >
                    <h3 className="h-display text-2xl">Tell us about the space</h3>
                    <p className="mt-2 text-[14.5px] text-espresso-900/55">
                      Your estimate updates as you go.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <Counter
                        label="Bedrooms"
                        value={form.bedrooms}
                        onChange={(n) => set('bedrooms', n)}
                      />
                      <Counter
                        label="Bathrooms"
                        value={form.bathrooms}
                        onChange={(n) => set('bathrooms', n)}
                      />
                      <div className="rounded-2xl border border-espresso-900/10 bg-cream-50 p-4">
                        <label
                          htmlFor="sqft"
                          className="text-[13px] font-semibold text-espresso-900/70"
                        >
                          Square feet
                        </label>
                        <input
                          id="sqft"
                          inputMode="numeric"
                          placeholder="Optional"
                          value={form.sqft}
                          onChange={(e) =>
                            set('sqft', e.target.value.replace(/\D/g, '').slice(0, 5))
                          }
                          className="mt-3 w-full bg-transparent font-display text-3xl
                                     text-espresso-950 outline-none placeholder:font-sans
                                     placeholder:text-base placeholder:text-espresso-900/30"
                        />
                      </div>
                    </div>

                    <div className="mt-7">
                      <p className="label">How often?</p>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        {frequencies.map((f) => {
                          const on = form.frequency === f.id;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => set('frequency', f.id)}
                              aria-pressed={on}
                              className={`rounded-2xl border px-3 py-3.5 text-center transition-all ${
                                on
                                  ? 'border-espresso-800 bg-espresso-950 text-cream-50'
                                  : 'border-espresso-900/10 bg-cream-50 hover:border-espresso-900/30'
                              }`}
                            >
                              <span className="block text-[13.5px] font-semibold">
                                {f.label}
                              </span>
                              <span
                                className={`mt-0.5 block text-[11.5px] ${
                                  on ? 'text-gold-300' : 'text-espresso-900/45'
                                }`}
                              >
                                {f.note}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-7">
                      <p className="label">Add anything else?</p>
                      <div className="flex flex-wrap gap-2">
                        {addOns.map((a) => {
                          const on = form.addOns.includes(a.id);
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() =>
                                set(
                                  'addOns',
                                  on
                                    ? form.addOns.filter((x) => x !== a.id)
                                    : [...form.addOns, a.id]
                                )
                              }
                              aria-pressed={on}
                              className={`inline-flex items-center gap-2 rounded-full border
                                          px-3.5 py-2 text-[13px] font-medium transition-all ${
                                            on
                                              ? 'border-gold-400 bg-gold-100 text-gold-700'
                                              : 'border-espresso-900/12 bg-cream-50 text-espresso-900/65 hover:border-gold-300'
                                          }`}
                            >
                              {on ? (
                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                              ) : (
                                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                              )}
                              {a.name}
                              <span className="opacity-60">+${a.price}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3: photos ── */}
                {step === 2 && (
                  <motion.div
                    key="photos"
                    initial={{ opacity: 0, x: reduce ? 0 : 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduce ? 0 : -24 }}
                    transition={{ duration: 0.28 }}
                  >
                    <h3 className="h-display text-2xl">
                      Show Katie the space{' '}
                      <span className="text-espresso-900/35">(optional)</span>
                    </h3>
                    <p className="mt-2 text-pretty text-[14.5px] leading-relaxed text-espresso-900/55">
                      A few photos help her bring the right supplies and give you
                      a firmer price up front. Skip it if you&apos;d rather not —
                      it won&apos;t hold up your request.
                    </p>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        addFiles(e.dataTransfer.files);
                      }}
                      className={`mt-6 rounded-3xl border-2 border-dashed p-8 text-center
                                  transition-all duration-200 ${
                                    dragging
                                      ? 'border-gold-400 bg-gold-100/50'
                                      : 'border-espresso-900/15 bg-cream-50'
                                  }`}
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-100">
                        <Camera className="h-6 w-6 text-gold-600" strokeWidth={2} />
                      </div>
                      <p className="mt-4 text-[15px] font-semibold text-espresso-950">
                        Drop photos here
                      </p>
                      <p className="mt-1 text-[13px] text-espresso-900/50">or</p>
                      <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="btn-ghost mt-3 !py-2.5 !text-[13.5px]"
                      >
                        <ImagePlus className="h-4 w-4" />
                        Choose from device
                      </button>
                      <p className="mt-4 text-[12px] text-espresso-900/40">
                        Up to {MAX_PHOTOS} photos · JPG, PNG, WEBP or HEIC · 8 MB each
                      </p>
                      <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) addFiles(e.target.files);
                          e.target.value = '';
                        }}
                      />
                    </div>

                    {errors.photos && (
                      <p className="mt-3 text-[13px] font-medium text-red-600">
                        {errors.photos}
                      </p>
                    )}

                    {photos.length > 0 && (
                      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                        <AnimatePresence>
                          {photos.map((p) => (
                            <motion.div
                              key={p.id}
                              layout
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.85 }}
                              className="group relative aspect-square overflow-hidden
                                         rounded-2xl border border-espresso-900/10"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p.url}
                                alt="Space to be cleaned"
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(p.id)}
                                aria-label="Remove photo"
                                className="absolute right-1.5 top-1.5 rounded-full bg-espresso-950/70
                                           p-1.5 opacity-0 backdrop-blur transition-opacity
                                           group-hover:opacity-100 focus-visible:opacity-100"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-white" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}

                    <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-sage-600/10 px-4 py-3.5">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-sage-700" />
                      <p className="text-[13px] leading-relaxed text-espresso-900/65">
                        Photos are private — only Katie can view them, and
                        they&apos;re never posted publicly.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 4: contact ── */}
                {step === 3 && (
                  <motion.div
                    key="contact"
                    initial={{ opacity: 0, x: reduce ? 0 : 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduce ? 0 : -24 }}
                    transition={{ duration: 0.28 }}
                  >
                    <h3 className="h-display text-2xl">Where and when?</h3>
                    <p className="mt-2 text-[14.5px] text-espresso-900/55">
                      Katie confirms every booking personally before anything is
                      locked in.
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="name" className="label">Your name</label>
                        <input
                          id="name"
                          value={form.name}
                          onChange={(e) => set('name', e.target.value)}
                          className={`field ${errors.name ? 'field-error' : ''}`}
                          placeholder="Jane Doe"
                          autoComplete="name"
                        />
                        {errors.name && (
                          <p className="mt-1.5 text-[12.5px] text-red-600">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="label">Email</label>
                        <input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => set('email', e.target.value)}
                          className={`field ${errors.email ? 'field-error' : ''}`}
                          placeholder="you@email.com"
                          autoComplete="email"
                        />
                        {errors.email && (
                          <p className="mt-1.5 text-[12.5px] text-red-600">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phone" className="label">Phone</label>
                        <input
                          id="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => set('phone', e.target.value)}
                          className={`field ${errors.phone ? 'field-error' : ''}`}
                          placeholder="802-555-0123"
                          autoComplete="tel"
                        />
                        {errors.phone && (
                          <p className="mt-1.5 text-[12.5px] text-red-600">{errors.phone}</p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="address" className="label">Street address</label>
                        <input
                          id="address"
                          value={form.address}
                          onChange={(e) => set('address', e.target.value)}
                          className={`field ${errors.address ? 'field-error' : ''}`}
                          placeholder="123 Maple Street"
                          autoComplete="street-address"
                        />
                        {errors.address && (
                          <p className="mt-1.5 text-[12.5px] text-red-600">{errors.address}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="city" className="label">Town / City</label>
                        <input
                          id="city"
                          value={form.city}
                          onChange={(e) => set('city', e.target.value)}
                          className={`field ${errors.city ? 'field-error' : ''}`}
                          placeholder="Burlington"
                          autoComplete="address-level2"
                        />
                        {errors.city && (
                          <p className="mt-1.5 text-[12.5px] text-red-600">{errors.city}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="zip" className="label">ZIP</label>
                        <input
                          id="zip"
                          inputMode="numeric"
                          value={form.zip}
                          onChange={(e) => set('zip', e.target.value)}
                          className={`field ${errors.zip ? 'field-error' : ''}`}
                          placeholder="05401"
                          autoComplete="postal-code"
                        />
                        {errors.zip && (
                          <p className="mt-1.5 text-[12.5px] text-red-600">{errors.zip}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="date" className="label">Preferred date</label>
                        <input
                          id="date"
                          type="date"
                          value={form.preferredDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => set('preferredDate', e.target.value)}
                          className="field"
                        />
                      </div>

                      <div>
                        <label htmlFor="time" className="label">Time of day</label>
                        <select
                          id="time"
                          value={form.preferredTime}
                          onChange={(e) => set('preferredTime', e.target.value)}
                          className="field"
                        >
                          <option value="flexible">I&apos;m flexible</option>
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="notes" className="label">
                          Anything Katie should know?
                        </label>
                        <textarea
                          id="notes"
                          rows={3}
                          value={form.notes}
                          onChange={(e) => set('notes', e.target.value)}
                          className="field resize-none"
                          placeholder="Pets, parking, alarm codes, problem areas, allergies…"
                        />
                      </div>
                    </div>

                    {submitError && (
                      <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
                        <p className="text-[13.5px] font-medium text-red-700">
                          {submitError}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nav buttons */}
              <div className="mt-9 flex items-center justify-between gap-3 border-t border-espresso-900/8 pt-6">
                <button
                  type="button"
                  onClick={() => goTo(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="btn-ghost !px-5 disabled:invisible"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                {step < STEPS.length - 1 ? (
                  <button type="button" onClick={next} className="btn-primary group">
                    {step === 2 && photos.length === 0 ? 'Skip for now' : 'Continue'}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="btn-maple group"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send my request
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Live estimate ── */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-4xl bg-espresso-950 p-2 shadow-lift">
              <div className="glow-wash rounded-[1.75rem] p-6 sm:p-7">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-200/60">
                  Your estimate
                </span>

                <div className="mt-3">
                  <motion.span
                    key={`${quote.low}-${quote.high}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="h-display block text-4xl tabular-nums text-cream-50 sm:text-[2.6rem]"
                  >
                    {formatMoney(quote.low)}
                    <span className="text-gold-400/60">–</span>
                    {formatMoney(quote.high)}
                  </motion.span>
                </div>

                <p className="mt-2 text-[13px] text-cream-200/50">
                  {currentService.name} ·{' '}
                  {frequencies.find((f) => f.id === form.frequency)?.label}
                </p>

                {quote.savings > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 inline-flex items-center gap-2 rounded-full
                               bg-gold-400/15 px-3.5 py-1.5"
                  >
                    <Check className="h-3.5 w-3.5 text-gold-300" strokeWidth={3} />
                    <span className="text-[12.5px] font-semibold text-gold-200">
                      Saving {formatMoney(quote.savings)} per visit
                    </span>
                  </motion.div>
                )}

                <div className="mt-6 space-y-2 border-t border-white/10 pt-5">
                  {quote.breakdown.map((b) => (
                    <div
                      key={b.label}
                      className="flex items-baseline justify-between gap-3 text-[13.5px]"
                    >
                      <span className="text-cream-200/60">{b.label}</span>
                      <span className="shrink-0 tabular-nums text-cream-100/85">
                        {formatMoney(b.amount)}
                      </span>
                    </div>
                  ))}
                  {quote.savings > 0 && (
                    <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                      <span className="text-gold-300">Frequency discount</span>
                      <span className="shrink-0 tabular-nums text-gold-300">
                        −{formatMoney(quote.savings)}
                      </span>
                    </div>
                  )}
                </div>

                <p className="mt-6 text-[12px] leading-relaxed text-cream-200/40">
                  This is an estimate, not a bill. Katie confirms the final price
                  after seeing the space — and never charges more than quoted
                  without asking first.
                </p>
              </div>
            </div>

            {photos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2.5 rounded-2xl border
                           border-espresso-900/8 bg-white px-4 py-3"
              >
                <Camera className="h-4 w-4 text-gold-600" />
                <span className="text-[13px] text-espresso-900/65">
                  {photos.length} photo{photos.length > 1 ? 's' : ''} attached
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
