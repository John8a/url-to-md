import type { Metadata } from 'next';
import { Inter, Space_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-roboto-mono' });

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
    <html lang="en">
      <body className={`${inter.variable} ${spaceMono.variable}`}>
        <div className="h-screen bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  );
}