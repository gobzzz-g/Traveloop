import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Traveloop – AI-Powered Travel Planning',
    template: '%s | Traveloop',
  },
  description: 'Plan perfect trips with AI-powered itineraries, smart budgeting, packing lists, and collaborative planning. Your intelligent travel companion.',
  keywords: ['travel planning', 'AI travel', 'itinerary builder', 'budget tracker', 'trip planner'],
  authors: [{ name: 'Traveloop' }],
  creator: 'Traveloop',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://traveloop.app',
    title: 'Traveloop – AI-Powered Travel Planning',
    description: 'Plan perfect trips with AI-powered itineraries and smart budgeting.',
    siteName: 'Traveloop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Traveloop – AI-Powered Travel Planning',
    description: 'Plan perfect trips with AI-powered itineraries and smart budgeting.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} bg-surface-900 text-surface-100 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
