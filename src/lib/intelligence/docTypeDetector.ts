import { DocumentType } from '@/types/database';

/**
 * Deterministic Document Type Auto-Detector (Sprint 13 Feature Epic)
 * Scoped STRICTLY to document_type auto-detection.
 *
 * ABSOLUTE RULE (Decision 10):
 * This detector NEVER infers or sets documents.jurisdiction.
 * Jurisdiction remains strictly user-supplied.
 */
export interface DocTypeDetectionResult {
  detectedType: DocumentType;
  displayName: string;
  confidence: number;
  matchedKeywords: string[];
}

export function detectDocumentType(rawText: string = ''): DocTypeDetectionResult {
  const lower = rawText.toLowerCase();

  const rules: Array<{
    type: DocumentType;
    displayName: string;
    keywords: string[];
  }> = [
    {
      type: 'terms_of_service',
      displayName: 'Terms of Service & Conditions',
      keywords: ['terms of service', 'terms and conditions', 'terms of use', 'user agreement', 'class action waiver', 'binding arbitration'],
    },
    {
      type: 'policy_document',
      displayName: 'Privacy Policy Document',
      keywords: ['privacy policy', 'data collection', 'cookie policy', 'personal data', 'information we collect', 'data protection officer'],
    },
    {
      type: 'rental_agreement',
      displayName: 'Rental & Lease Agreement',
      keywords: ['lease agreement', 'rental agreement', 'landlord', 'tenant', 'security deposit', 'subletting', 'premises', 'monthly rent'],
    },
    {
      type: 'employment_contract',
      displayName: 'Employment Contract',
      keywords: ['employment agreement', 'employee', 'employer', 'salary', 'base pay', 'job duties', 'non-compete', 'moonlighting', 'invention assignment'],
    },
    {
      type: 'nda',
      displayName: 'Non-Disclosure Agreement (NDA)',
      keywords: ['non-disclosure agreement', 'mutual nda', 'confidential information', 'disclosing party', 'receiving party', 'proprietary information'],
    },
    {
      type: 'loan_document',
      displayName: 'Loan & Credit Agreement',
      keywords: ['loan agreement', 'promissory note', 'borrower', 'lender', 'principal amount', 'interest rate', 'maturity date', 'default cure'],
    },
    {
      type: 'service_agreement',
      displayName: 'Service Agreement / SLA',
      keywords: ['service agreement', 'master services agreement', 'statement of work', 'contractor', 'deliverables', 'service level agreement'],
    },
  ];

  let bestMatch: DocTypeDetectionResult = {
    detectedType: 'other',
    displayName: 'General Legal Document',
    confidence: 0.5,
    matchedKeywords: [],
  };

  let maxScore = 0;

  for (const rule of rules) {
    const matched = rule.keywords.filter((kw) => lower.includes(kw));
    if (matched.length > maxScore) {
      maxScore = matched.length;
      bestMatch = {
        detectedType: rule.type,
        displayName: rule.displayName,
        confidence: Math.min(0.99, 0.6 + matched.length * 0.1),
        matchedKeywords: matched,
      };
    }
  }

  return bestMatch;
}
