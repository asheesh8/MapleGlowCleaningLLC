import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { business } from '@/lib/content';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${business.legalName} — Insured Home & Office Cleaning in Vermont`,
    template: `%s · ${business.name}`,
  },
  description:
    'Owner-operated, fully insured cleaning for Vermont homes and businesses. Deep cleans, Airbnb turnovers, grout sealing, carpets, and more. Get an instant estimate in under a minute.',
  keywords: [
    'Vermont cleaning service',
    'house cleaning Vermont',
    'Airbnb turnover cleaning',
    'deep cleaning Vermont',
    'grout cleaning and sealing',
    'Maple Glow Cleaning',
  ],
  openGraph: {
    title: `${business.legalName} — Insured Cleaning in Vermont`,
    description: business.tagline,
    type: 'website',
    locale: 'en_US',
    images: ['/banner.jpg'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0A0A09',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HouseholdCleaningService',
              name: business.legalName,
              telephone: business.phone,
              email: business.email,
              slogan: business.slogan,
              areaServed: { '@type': 'State', name: 'Vermont' },
              sameAs: [business.facebook],
              founder: { '@type': 'Person', name: business.owner },
            }),
          }}
        />
      </body>
    </html>
  );
}
