import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CarbonWise AI — Your Personal Sustainability Coach',
    template: '%s | CarbonWise AI',
  },
  description:
    'Track, understand, and reduce your carbon footprint with AI-powered insights, personalized recommendations, and Carbon Twin simulations.',
  keywords: [
    'carbon footprint',
    'sustainability',
    'AI coach',
    'climate action',
    'eco tracking',
    'carbon twin',
  ],
  authors: [{ name: 'CarbonWise AI' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'CarbonWise AI',
    description: 'Your Personal Sustainability Coach',
    type: 'website',
    locale: 'en_US',
  },
};

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
