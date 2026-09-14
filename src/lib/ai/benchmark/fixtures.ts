import { ExtractedSection } from '../../extraction/types';
import { ExtractedClauseItem, ExtractedEntityItem, ExtractedChunkItem } from '../../intelligence/types';
import { XRayFindingCard } from '../../xray/types';

export interface GroundTruthDocument {
  id: string;
  versionId: string;
  title: string;
  rawText: string;
  sections: ExtractedSection[];
  chunks: ExtractedChunkItem[];
  expectedEntities: Partial<ExtractedEntityItem>[];
  expectedClauses: Partial<ExtractedClauseItem>[];
  expectedFindings: Partial<XRayFindingCard>[];
  expectedDates: string[];
  expectedVerbatimQuotes: string[];
  userJurisdiction?: string;
}

/**
  Benchmark Document 1: Mutual Non-Disclosure Agreement (NDA)
 */
export const BENCHMARK_NDA_TEXT = `MUTUAL NON-DISCLOSURE AGREEMENT
This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of January 15, 2025 ("Effective Date"), by and between Acme Corporation, a Delaware corporation ("Disclosing Party"), and Beta LLC, a New York limited liability company ("Receiving Party").

1. Confidential Information. Confidential Information includes all technical, financial, and business information disclosed by either party.
2. Obligations of Non-Use and Non-Disclosure. Receiving Party agrees to hold Confidential Information in strict confidence for a period of twenty-four (24) months from the Effective Date.
3. Notice Period & Remedies. In the event of a breach, written notice of default must be delivered within thirty (30) days. Liquidated damages for unauthorized disclosure shall equal $50,000 per violation.
4. Governing Law. This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware.`;

const ndaSections: ExtractedSection[] = [
  { id: 'sec_1', title: 'Preamble', section_type: 'header', order_index: 0, content: 'This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of January 15, 2025 ("Effective Date"), by and between Acme Corporation, a Delaware corporation ("Disclosing Party"), and Beta LLC, a New York limited liability company ("Receiving Party").', page_start: 1, page_end: 1 },
  { id: 'sec_2', title: '1. Confidential Information', section_type: 'section', order_index: 1, content: '1. Confidential Information. Confidential Information includes all technical, financial, and business information disclosed by either party.', page_start: 1, page_end: 1 },
  { id: 'sec_3', title: '2. Obligations of Non-Use and Non-Disclosure', section_type: 'section', order_index: 2, content: '2. Obligations of Non-Use and Non-Disclosure. Receiving Party agrees to hold Confidential Information in strict confidence for a period of twenty-four (24) months from the Effective Date.', page_start: 1, page_end: 1 },
  { id: 'sec_4', title: '3. Notice Period & Remedies', section_type: 'section', order_index: 3, content: '3. Notice Period & Remedies. In the event of a breach, written notice of default must be delivered within thirty (30) days. Liquidated damages for unauthorized disclosure shall equal $50,000 per violation.', page_start: 1, page_end: 1 },
  { id: 'sec_5', title: '4. Governing Law', section_type: 'section', order_index: 4, content: '4. Governing Law. This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware.', page_start: 1, page_end: 1 },
];

export const BENCHMARK_NDA: GroundTruthDocument = {
  id: 'doc_bm_nda_101',
  versionId: 'ver_bm_nda_101_v1',
  title: 'Mutual Non-Disclosure Agreement',
  rawText: BENCHMARK_NDA_TEXT,
  sections: ndaSections,
  chunks: ndaSections.map((sec, idx) => ({
    id: `chk_nda_${idx + 1}`,
    document_id: 'doc_bm_nda_101',
    document_version_id: 'ver_bm_nda_101_v1',
    section_id: sec.id,
    content: sec.content,
    chunk_index: idx,
    embedding_reference: `emb_nda_${idx + 1}`,
    page_start: sec.page_start,
    page_end: sec.page_end,
    token_count: Math.ceil(sec.content.length / 4),
  })),
  expectedEntities: [
    { entity_type: 'party', normalized_value: 'Acme Corporation' },
    { entity_type: 'party', normalized_value: 'Beta LLC' },
    { entity_type: 'location', normalized_value: 'Delaware' },
  ],
  expectedClauses: [
    { clause_type: 'confidentiality', title: 'Obligations of Non-Use and Non-Disclosure', severity_level: 'yellow', finding_kind: 'informational' },
    { clause_type: 'liability_indemnification', title: 'Notice Period & Remedies', severity_level: 'orange', finding_kind: 'deadline' },
    { clause_type: 'dispute_resolution', title: 'Governing Law', severity_level: 'green', finding_kind: 'informational' },
  ],
  expectedFindings: [
    { category: 'Confidentiality & Non-Disclosure', severity: 'yellow', finding_kind: 'informational' },
    { category: 'Liability & Risk Allocation', severity: 'orange', finding_kind: 'deadline' },
  ],
  expectedDates: ['January 15, 2025', 'twenty-four (24) months', 'thirty (30) days'],
  expectedVerbatimQuotes: [
    'twenty-four (24) months',
    'thirty (30) days',
    '$50,000',
    'State of Delaware',
  ],
};

/**
  Benchmark Document 2: Executive Employment Agreement
 */
export const BENCHMARK_EMPLOYMENT_TEXT = `EXECUTIVE EMPLOYMENT AGREEMENT
This Executive Employment Agreement ("Agreement") is effective as of March 1, 2025, by Apex Tech Inc. ("Employer") and Jane Doe ("Employee").

1. Position & Base Salary. Employee shall serve as Chief Technology Officer with an annual base salary of $180,000 payable semi-monthly.
2. Non-Compete & Restrictive Covenants. For a period of twelve (12) months following termination of employment within a 50-mile radius of Employer's headquarters, Employee shall not directly engage in competing software activities.
3. Termination & Notice. Either party may terminate employment upon sixty (60) days advance written notice.
4. Governing Law. This Agreement is governed by the laws of California.`;

const empSections: ExtractedSection[] = [
  { id: 'sec_e1', title: 'Preamble', section_type: 'header', order_index: 0, content: 'This Executive Employment Agreement ("Agreement") is effective as of March 1, 2025, by Apex Tech Inc. ("Employer") and Jane Doe ("Employee").', page_start: 1, page_end: 1 },
  { id: 'sec_e2', title: '1. Position & Base Salary', section_type: 'section', order_index: 1, content: '1. Position & Base Salary. Employee shall serve as Chief Technology Officer with an annual base salary of $180,000 payable semi-monthly.', page_start: 1, page_end: 1 },
  { id: 'sec_e3', title: '2. Non-Compete & Restrictive Covenants', section_type: 'section', order_index: 2, content: '2. Non-Compete & Restrictive Covenants. For a period of twelve (12) months following termination of employment within a 50-mile radius of Employer\'s headquarters, Employee shall not directly engage in competing software activities.', page_start: 1, page_end: 1 },
  { id: 'sec_e4', title: '3. Termination & Notice', section_type: 'section', order_index: 3, content: '3. Termination & Notice. Either party may terminate employment upon sixty (60) days advance written notice.', page_start: 1, page_end: 1 },
  { id: 'sec_e5', title: '4. Governing Law', section_type: 'section', order_index: 4, content: '4. Governing Law. This Agreement is governed by the laws of California.', page_start: 1, page_end: 1 },
];

export const BENCHMARK_EMPLOYMENT: GroundTruthDocument = {
  id: 'doc_bm_emp_202',
  versionId: 'ver_bm_emp_202_v1',
  title: 'Executive Employment Agreement',
  rawText: BENCHMARK_EMPLOYMENT_TEXT,
  sections: empSections,
  chunks: empSections.map((sec, idx) => ({
    id: `chk_emp_${idx + 1}`,
    document_id: 'doc_bm_emp_202',
    document_version_id: 'ver_bm_emp_202_v1',
    section_id: sec.id,
    content: sec.content,
    chunk_index: idx,
    embedding_reference: `emb_emp_${idx + 1}`,
    page_start: sec.page_start,
    page_end: sec.page_end,
    token_count: Math.ceil(sec.content.length / 4),
  })),
  expectedEntities: [
    { entity_type: 'party', normalized_value: 'Apex Tech Inc.' },
    { entity_type: 'party', normalized_value: 'Jane Doe' },
    { entity_type: 'location', normalized_value: 'California' },
  ],
  expectedClauses: [
    { clause_type: 'payment_terms', title: 'Position & Base Salary', severity_level: 'green', finding_kind: 'informational' },
    { clause_type: 'confidentiality', title: 'Non-Compete & Restrictive Covenants', severity_level: 'red', finding_kind: 'action_required' },
    { clause_type: 'termination', title: 'Termination & Notice', severity_level: 'orange', finding_kind: 'deadline' },
  ],
  expectedFindings: [
    { category: 'Payment & Compensation', severity: 'green', finding_kind: 'informational' },
    { category: 'General Provisions', severity: 'red', finding_kind: 'action_required' },
    { category: 'Termination & Cancellation', severity: 'orange', finding_kind: 'deadline' },
  ],
  expectedDates: ['March 1, 2025', 'twelve (12) months', 'sixty (60) days'],
  expectedVerbatimQuotes: [
    'March 1, 2025',
    '$180,000',
    'twelve (12) months',
    'sixty (60) days',
    'California',
  ],
};

/**
  Benchmark Document 3: Commercial Lease Agreement
 */
export const BENCHMARK_LEASE_TEXT = `COMMERCIAL LEASE AGREEMENT
This Commercial Lease Agreement ("Lease") is dated June 1, 2025, between Prime Realty Holdings ("Landlord") and Tenant Corp ("Tenant").

1. Term & Monthly Rent. Lease term shall be five (5) years commencing June 1, 2025. Tenant agrees to pay base rent of $5,000 per month due on the 1st of each calendar month.
2. Security Deposit. Tenant shall deposit $10,000 as security upon execution.
3. Default & Right to Cure. In the event of rent non-payment, Tenant shall have thirty (30) days written cure notice before lease forfeiture.
4. Governing Law. Regulated under New York State commercial property law.`;

const leaseSections: ExtractedSection[] = [
  { id: 'sec_l1', title: 'Preamble', section_type: 'header', order_index: 0, content: 'This Commercial Lease Agreement ("Lease") is dated June 1, 2025, between Prime Realty Holdings ("Landlord") and Tenant Corp ("Tenant").', page_start: 1, page_end: 1 },
  { id: 'sec_l2', title: '1. Term & Monthly Rent', section_type: 'section', order_index: 1, content: '1. Term & Monthly Rent. Lease term shall be five (5) years commencing June 1, 2025. Tenant agrees to pay base rent of $5,000 per month due on the 1st of each calendar month.', page_start: 1, page_end: 1 },
  { id: 'sec_l3', title: '2. Security Deposit', section_type: 'section', order_index: 2, content: '2. Security Deposit. Tenant shall deposit $10,000 as security upon execution.', page_start: 1, page_end: 1 },
  { id: 'sec_l4', title: '3. Default & Right to Cure', section_type: 'section', order_index: 3, content: '3. Default & Right to Cure. In the event of rent non-payment, Tenant shall have thirty (30) days written cure notice before lease forfeiture.', page_start: 1, page_end: 1 },
  { id: 'sec_l5', title: '4. Governing Law', section_type: 'section', order_index: 4, content: '4. Governing Law. Regulated under New York State commercial property law.', page_start: 1, page_end: 1 },
];

export const BENCHMARK_LEASE: GroundTruthDocument = {
  id: 'doc_bm_lse_303',
  versionId: 'ver_bm_lse_303_v1',
  title: 'Commercial Lease Agreement',
  rawText: BENCHMARK_LEASE_TEXT,
  sections: leaseSections,
  chunks: leaseSections.map((sec, idx) => ({
    id: `chk_lse_${idx + 1}`,
    document_id: 'doc_bm_lse_303',
    document_version_id: 'ver_bm_lse_303_v1',
    section_id: sec.id,
    content: sec.content,
    chunk_index: idx,
    embedding_reference: `emb_lse_${idx + 1}`,
    page_start: sec.page_start,
    page_end: sec.page_end,
    token_count: Math.ceil(sec.content.length / 4),
  })),
  expectedEntities: [
    { entity_type: 'party', normalized_value: 'Prime Realty Holdings' },
    { entity_type: 'party', normalized_value: 'Tenant Corp' },
    { entity_type: 'location', normalized_value: 'New York' },
  ],
  expectedClauses: [
    { clause_type: 'payment_terms', title: 'Term & Monthly Rent', severity_level: 'green', finding_kind: 'informational' },
    { clause_type: 'payment_terms', title: 'Security Deposit', severity_level: 'yellow', finding_kind: 'informational' },
    { clause_type: 'termination', title: 'Default & Right to Cure', severity_level: 'orange', finding_kind: 'deadline' },
  ],
  expectedFindings: [
    { category: 'Payment & Compensation', severity: 'green', finding_kind: 'informational' },
    { category: 'Payment & Compensation', severity: 'yellow', finding_kind: 'informational' },
    { category: 'Termination & Cancellation', severity: 'orange', finding_kind: 'deadline' },
  ],
  expectedDates: ['June 1, 2025', 'five (5) years', 'thirty (30) days'],
  expectedVerbatimQuotes: [
    'June 1, 2025',
    'five (5) years',
    '$5,000',
    '$10,000',
    'thirty (30) days',
    'New York State',
  ],
};

export const ALL_BENCHMARK_DOCUMENTS = [BENCHMARK_NDA, BENCHMARK_EMPLOYMENT, BENCHMARK_LEASE];
