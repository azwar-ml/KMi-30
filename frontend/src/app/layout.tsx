import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/query-provider';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KMI-30 Alpha v4.0 | Institutional Investment Terminal',
  description: 'Bloomberg-grade institutional intelligence platform for Pakistan\'s Top 30 PSX stocks',
  keywords: ['PSX', 'KMI-30', 'stocks', 'investment', 'trading', 'terminal'],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'noindex, nofollow', // Private platform
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="bg-gradient-bloomberg text-slate-100">
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
