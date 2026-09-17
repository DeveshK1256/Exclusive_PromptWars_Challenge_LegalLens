import { describe, it, expect } from 'vitest';
import {
  generatePortfolioReport,
  calculateDocumentRiskScore,
  determinePortfolioGrade,
} from './portfolioAggregator';
import { Document, Finding } from '@/types/database';

describe('Feature 3 — Portfolio Risk Aggregator & Transparent Formula', () => {
  const userA = 'user_alice_123';
  const userB = 'user_bob_456';

  const doc1Completed: Document = {
    id: 'doc_1',
    user_id: userA,
    title: 'Employment Agreement 2026',
    original_filename: 'employment.pdf',
    mime_type: 'application/pdf',
    file_size: 10240,
    file_hash: 'hash1',
    storage_path: '/path/1',
    document_type: 'employment_contract',
    jurisdiction: null,
    status: 'completed',
    deleted_at: null,
    retention_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const doc2Completed: Document = {
    id: 'doc_2',
    user_id: userA,
    title: 'Vendor SLA Agreement',
    original_filename: 'sla.pdf',
    mime_type: 'application/pdf',
    file_size: 20480,
    file_hash: 'hash2',
    storage_path: '/path/2',
    document_type: 'service_agreement',
    jurisdiction: null,
    status: 'completed',
    deleted_at: null,
    retention_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const doc3Processing: Document = {
    id: 'doc_3',
    user_id: userA,
    title: 'Unfinished NDA Upload',
    original_filename: 'nda_draft.pdf',
    mime_type: 'application/pdf',
    file_size: 5120,
    file_hash: 'hash3',
    storage_path: '/path/3',
    document_type: 'nda',
    jurisdiction: null,
    status: 'extracting', // NOT completed
    deleted_at: null,
    retention_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const docUserB: Document = {
    id: 'doc_4',
    user_id: userB,
    title: 'Bob Private Lease',
    original_filename: 'lease.pdf',
    mime_type: 'application/pdf',
    file_size: 12000,
    file_hash: 'hash4',
    storage_path: '/path/4',
    document_type: 'rental_agreement',
    jurisdiction: null,
    status: 'completed',
    deleted_at: null,
    retention_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const findingsDoc1: Finding[] = [
    {
      id: 'f1',
      document_id: 'doc_1',
      document_version_id: 'v1',
      clause_id: 'c1',
      category: 'Termination',
      severity: 'red', // 15 pts
      title: 'Immediate Termination Without Notice',
      description: 'Employer can terminate instantly.',
      finding_type: 'recommendation',
      confidence: 0.95,
      source_reference: 'Section 9',
      created_at: new Date().toISOString(),
    },
    {
      id: 'f2',
      document_id: 'doc_1',
      document_version_id: 'v1',
      clause_id: 'c2',
      category: 'IP Rights',
      severity: 'orange', // 7 pts
      title: 'Broad Invention Assignment',
      description: 'Covers pre-existing projects.',
      finding_type: 'recommendation',
      confidence: 0.9,
      source_reference: 'Section 4',
      created_at: new Date().toISOString(),
    },
  ]; // doc1 total score = 15 + 7 = 22

  const findingsDoc2: Finding[] = [
    {
      id: 'f3',
      document_id: 'doc_2',
      document_version_id: 'v1',
      clause_id: 'c3',
      category: 'Payment Terms',
      severity: 'yellow', // 2 pts
      title: 'Net 60 Payment Window',
      description: 'Extended payment terms.',
      finding_type: 'general_information',
      confidence: 0.85,
      source_reference: 'Section 2',
      created_at: new Date().toISOString(),
    },
  ]; // doc2 total score = 2

  it('1. Correctly calculates single document risk score using weighted formula', () => {
    const res1 = calculateDocumentRiskScore(findingsDoc1);
    expect(res1.score).toBe(22); // 1 Red (15) + 1 Orange (7)
    expect(res1.redCount).toBe(1);
    expect(res1.orangeCount).toBe(1);

    const res2 = calculateDocumentRiskScore(findingsDoc2);
    expect(res2.score).toBe(2); // 1 Yellow (2)
  });

  it('2. Maps portfolio score to grade correctly', () => {
    expect(determinePortfolioGrade(5).grade).toBe('A');
    expect(determinePortfolioGrade(15).grade).toBe('B');
    expect(determinePortfolioGrade(35).grade).toBe('C');
    expect(determinePortfolioGrade(55).grade).toBe('D');
    expect(determinePortfolioGrade(80).grade).toBe('F');
  });

  it('3. EXCLUDES processing/failed/uncompleted documents from formula denominator & sum', () => {
    const report = generatePortfolioReport(
      userA,
      [doc1Completed, doc2Completed, doc3Processing],
      [...findingsDoc1, ...findingsDoc2]
    );

    // Total documents owned = 3, but completed = 2, excluded = 1
    expect(report.totalDocuments).toBe(3);
    expect(report.completedDocumentsCount).toBe(2);
    expect(report.excludedDocumentsCount).toBe(1);

    // Sum of completed scores = 22 (doc1) + 2 (doc2) = 24.
    // PortfolioScore = 24 / 2 = 12.0
    expect(report.overallPortfolioScore).toBe(12);
    expect(report.portfolioGrade).toBe('B'); // 12 falls into Grade B (11-25)
  });

  it('4. Strict RLS User Isolation — User B documents & findings are never included for User A', () => {
    const reportA = generatePortfolioReport(
      userA,
      [doc1Completed, doc2Completed, docUserB],
      [...findingsDoc1, ...findingsDoc2]
    );

    expect(reportA.totalDocuments).toBe(2); // docUserB omitted
    expect(reportA.documentSummaries.some((s) => s.document.id === 'doc_4')).toBe(false);
  });
});
