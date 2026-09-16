import type { Metadata } from 'next';
import './globals.css';
import { LegalDisclaimerBanner } from '@/components/ui/LegalDisclaimerBanner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'LegalLens AI — AI Legal Navigation Assistant',
  description: 'Understand, compare, and navigate legal documents with grounded AI assistance.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      'name': 'LegalLens AI',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'Web',
      'description': 'AI Legal Navigation Assistant that translates complex contracts, lease agreements, ToS, and NDAs into plain-language visual risk scorecards, ELI5 summaries, and grounded Q&A with line-level source citations.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
      },
      'featureList': [
        'Document Legal X-Ray Risk Scorecard',
        'Data & Permissions Scorecard for Terms of Service',
        'Visual Obligation & Deadline Timeline with 1-Click Calendar Sync',
        'Employment Non-Compete & IP Restriction Heatmap',
        'ELI5 Side-by-Side Summary Viewer',
        'Interactive Hover Legal Glossary',
        'Email Counter-Offer Generator',
        'Printable 1-Page Attorney Prep Sheet',
        'Grounded Document Q&A with Source Citations',
      ],
    },
    {
      '@type': 'Organization',
      'name': 'LegalLens AI',
      'url': 'https://exclusive-prompt-wars-challenge-leg-xi.vercel.app',
      'logo': 'https://exclusive-prompt-wars-challenge-leg-xi.vercel.app/icon.svg',
      'sameAs': [
        'https://github.com/DeveshK1256/Exclusive_PromptWars_Challenge_LegalLens',
      ],
    },
    {
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'What is LegalLens AI?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'LegalLens AI is an AI Legal Navigation Assistant designed to help non-lawyers analyze contracts, apartment leases, service agreements, and terms of service using plain-language visual scorecards, ELI5 split-screen summaries, and grounded Q&A.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Is LegalLens AI a replacement for a lawyer?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'No. LegalLens AI provides document navigation and informational analysis only, not legal advice. It creates a 1-Page Attorney Prep Sheet to help users consult qualified legal professionals effectively.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Does LegalLens AI train public models on my documents?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'No. LegalLens AI enforces zero public model training policies and complete user document isolation backed by Supabase Row-Level Security (RLS).',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased transition-colors duration-200">
        <ThemeProvider>
          <LegalDisclaimerBanner />
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
