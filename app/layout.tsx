import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'URL to Markdown Converter',
  description: 'Convert any webpage to clean, formatted Markdown with live preview',
  keywords: ['markdown', 'converter', 'web scraping', 'content extraction', 'documentation'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'URL to Markdown Converter',
    description: 'Convert any webpage to clean, formatted Markdown with live preview',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'URL to Markdown Converter',
    description: 'Convert any webpage to clean, formatted Markdown with live preview',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          {children}
        </main>
      </body>
    </html>
  );
}