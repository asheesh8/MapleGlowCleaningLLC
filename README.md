# Maple Glow Cleaning LLC

Marketing site + booking system for [Maple Glow Cleaning LLC](https://www.facebook.com/profile.php?id=61590621946523),
an owner-operated, fully insured cleaning business serving Vermont.

## Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **Tailwind CSS** with a palette taken from Katie's own logo (gold / sage / near-black)
- **Framer Motion** for transitions, the before/after slider, and the marquee
- **Prisma + SQLite** for bookings, photos, testimonials, and the admin user
- **jose** (JWT in an httpOnly cookie) + **bcryptjs** for admin auth

## Getting started

```bash
npm install
npm run setup   # prisma db push + seed admin user & testimonials
npm run dev
```

Then open http://localhost:3000. The admin lives at `/admin`.

Credentials come from `.env` (see `.env.example`). **Change `ADMIN_PASSWORD`
and regenerate `AUTH_SECRET` before deploying.**

## Routes

| Route | What it is |
| --- | --- |
| `/` | Hero, service grid, work teaser, reviews, CTA |
| `/services` | All seven services + drag-to-compare before/after |
| `/book` | Four-step quote wizard with live pricing and optional photo upload |
| `/gallery` | 70 job photos with a keyboard-navigable lightbox |
| `/about` | Katie's story + reviews |
| `/contact` | Phone, email, Facebook, service area |
| `/admin` | Booking inbox with statuses, search, and customer photos |
| `/admin/reviews` | Add, hide, and delete testimonials |

## How pricing works

`lib/pricing.ts` computes a **range**, never a fixed bill: a per-service base,
plus extra bedrooms/bathrooms, plus add-ons, minus a frequency discount, then
±12% for unknown condition. The server **recomputes the quote on submit** and
ignores any price sent by the client.

## Customer photo privacy

Photos uploaded through the booking form show the inside of people's homes, so
they are deliberately **not** served from `public/`. They are written to
`private-uploads/` (gitignored) and streamed through `/api/photos/[id]`, which
requires a valid admin session. Uploads are validated by **magic-byte sniffing**,
not by the client-supplied MIME type, and stored under a random UUID filename.

## Content

Copy, services, and pricing live in `lib/content.ts`. Photos in `public/gallery/`
came from the business's own Facebook page.

> **Before going live:** confirm with Katie that every gallery image is her own
> work. Some images on the Facebook page are labelled "AI content" by Facebook
> and at least one appears to be a stock/marketing composite rather than a real
> job. Also get sign-off from anyone quoted in a testimonial.
