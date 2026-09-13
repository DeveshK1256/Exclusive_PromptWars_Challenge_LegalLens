import type { Metadata } from 'next';
import './globals.css';
import { LegalDisclaimerBanner } from '@/components/ui/LegalDisclaimerBanner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'LegalLens AI — AI Legal Navigation Assistant',
  description: 'Understand, compare, and navigate legal documents with grounded AI assistance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        <LegalDisclaimerBanner />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
