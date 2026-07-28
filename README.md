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

Admin credentials default to `propsk28@gmail.com` / `CLEAN` (see
`.env.example`). Regenerate `AUTH_SECRET` before deploying.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Hero, service grid, work teaser, reviews, CTA |
| `/services` | Active services + drag-to-compare before/after |
| `/book` | Four-step quote wizard with live pricing and optional photo upload |
| `/gallery` | 70 job photos with a keyboard-navigable lightbox |
| `/about` | Katie's story + reviews |
| `/contact` | Phone, email, Facebook, service area |
| `/admin` | Booking inbox with statuses, search, and customer photos |
| `/admin/chat` | Receptionist chat inbox |
| `/admin/pricing` | Add services and edit service/add-on pricing |
| `/admin/reviews` | Add, hide, and delete testimonials |

## How pricing works

`lib/pricing.ts` computes a **range**, never a fixed bill: a per-service base,
plus extra bedrooms/bathrooms, plus add-ons, minus a frequency discount, then
±12% for unknown condition. Service and add-on prices are stored in Prisma and
editable at `/admin/pricing`; the server **recomputes the quote on submit** and
ignores any price sent by the client.

## Customer photo privacy

Photos uploaded through the booking form show the inside of people's homes, so
they are deliberately **not** served from `public/`. They are written to
`private-uploads/` (gitignored) and streamed through `/api/photos/[id]`, which
requires a valid admin session. Uploads are validated by **magic-byte sniffing**,
not by the client-supplied MIME type, and stored under a random UUID filename.

## Receptionist chat

The floating chat widget stores conversations in Prisma and shows them at
`/admin/chat`. The reply generator is intentionally a local placeholder in
`lib/receptionist.ts`; replace that function with your Supabase or agent call
when you are ready to wire API keys.

## Content

Business copy and fallback catalog defaults live in `lib/content.ts`. The live
service/add-on catalog lives in Prisma after `npm run setup`. Photos in
`public/gallery/` came from the business's own Facebook page.

> **Before going live:** confirm with Katie that every gallery image is her own
> work. Some images on the Facebook page are labelled "AI content" by Facebook
> and at least one appears to be a stock/marketing composite rather than a real
> job. Also get sign-off from anyone quoted in a testimonial.
