import type { Metadata } from 'next';
import './globals.css';
import { LegalDisclaimerBanner } from '@/components/ui/LegalDisclaimerBanner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'LegalLens AI — AI for Legal Assistance & Access',
  description: 'GenAI-powered solution for legal assistance and access. Simplify, compare, and navigate legal documents with grounded AI assistance — information and assistance, not legal advice.',
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
      'description': 'GenAI-powered solution for legal assistance and access — helps users understand, compare, and navigate legal documents. Provides information and assistance, not professional legal advice.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
      },
      'featureList': [
        '1. Simplifying complex legal documents — Multi-level plain-language summaries (Very Simple to Legal Terminology)',
        '2. Comparing contracts, agreements, or policies — Semantic clause-by-clause comparison with missing clause detection',
        '3. Highlighting important clauses, obligations, risks — Legal X-Ray with severity_level and finding_kind classification',
        '4. Answering questions based on provided legal documents — Grounded Q&A with vector retrieval and source citations',
        '5. Helping users understand options and potential next steps — Perspective-aware Personal Impact by context_role',
        '6. Generating summaries, checklists, and actionable outputs — Before-You-Sign checklist and calendar deadline export',
        '7. Helping users prepare questions for a legal professional — Lawyer Consultation Question Generator',
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
            'text': 'LegalLens AI is a GenAI-powered solution for legal assistance and access. It helps non-lawyers understand, compare, and navigate contracts, apartment leases, service agreements, and terms of service using plain-language summaries, Legal X-Ray risk analysis, grounded Q&A with source citations, and actionable checklists.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Is LegalLens AI a replacement for a lawyer?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'No. LegalLens AI provides document navigation and informational analysis only, not legal advice. It generates questions for users to bring to qualified legal professionals, bridging the gap between AI assistance and professional counsel.',
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
