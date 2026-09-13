import { describe, it, expect } from 'vitest';
import { extractDocument } from './extraction/extractor';
import { chunkSections } from './intelligence/chunker';
import { extractEntities } from './intelligence/entities';
import { classifyClauses } from './intelligence/clauses';
import { retrieveRelevantChunks } from './intelligence/retrieval';
import { buildDocumentManifest } from './intelligence/manifest';
import { runDocumentIntelligenceAgent } from './ai/agents/documentIntelligenceAgent';
import { recordAIRunLog } from './ai/gemini';
import { AI_CONFIG } from './ai/config';

describe('Sprint 4 — Document Intelligence & Benchmark Suite', () => {
  const docId = 'doc_benchmark_101';
  const verId = 'ver_benchmark_v1';

  // Benchmark Document 1: Non-Disclosure Agreement (NDA)
  const benchmarkNDA = `MUTUAL NON-DISCLOSURE AGREEMENT
This Non-Disclosure Agreement is made between Acme Corp and Beta LLC on January 15, 2026.
\fSECTION 1: CONFIDENTIAL INFORMATION
The receiving party agrees to hold in confidence all proprietary technical and business information.
\fSECTION 2: TERMINATION
This agreement shall terminate on December 31, 2028 or upon 30 days written notice by either party.`;

  // Benchmark Document 2: Employment Agreement
  const benchmarkEmployment = `EMPLOYMENT AGREEMENT
This Employment Agreement is entered into by and between Tech Corp and John Doe.
\fSECTION 1: COMPENSATION AND SALARY
The Employee shall receive an annual base salary of $120,000 payable bi-weekly.
\fSECTION 2: TERMINATION NOTICE
Either party may terminate employment upon 14 days written notice.`;

  // Benchmark Document 3: Residential Lease Agreement
  const benchmarkLease = `RESIDENTIAL RENTAL LEASE
This Lease is entered into between Landlord Properties and Jane Smith.
\fSECTION 1: MONTHLY RENT OBLIGATION
The Tenant shall pay monthly rent of $2,500 due on the 1st of each calendar month.
\fSECTION 2: DISPUTE RESOLUTION
Any legal dispute arising under this lease shall be governed by state arbitration rules.`;

  it('Benchmark Document 1 (NDA): extracts expected parties, dates, clauses, and populates source_reference + confidence float', async () => {
    const buffer = Buffer.from(benchmarkNDA, 'utf-8');
    const extraction = await extractDocument(buffer, 'text/plain', 'mutual_nda.txt');

    expect(extraction.status).toBe('completed');
    const chunks = chunkSections(extraction.sections, docId, verId);
    const entities = extractEntities(extraction.sections, docId, verId, extraction.metadata.isPageEstimate);
    const clauses = classifyClauses(extraction.sections, docId, verId, extraction.metadata.isPageEstimate);
    const manifest = buildDocumentManifest(docId, verId, 'nda', entities, clauses, chunks);

    // Verify Manifest
    expect(manifest.document_type).toBe('nda');
    expect(manifest.parties).toContain('Acme Corp');
    expect(manifest.parties).toContain('Beta LLC');

    // Verify Evidence Validator Rule & Confidence Float on Entities
    expect(entities.length).toBeGreaterThan(0);
    entities.forEach((entity) => {
      expect(entity.source_reference).toBeDefined();
      expect(entity.source_reference.length).toBeGreaterThan(5);
      expect(entity.confidence).toBeGreaterThanOrEqual(0.0);
      expect(entity.confidence).toBeLessThanOrEqual(1.0);
      expect(entity.document_version_id).toBe(verId); // Version scoping check
    });

    // Verify Evidence Validator Rule & Separate Severity/Kind Split on Clauses
    expect(clauses.length).toBeGreaterThanOrEqual(2);
    clauses.forEach((clause) => {
      expect(clause.source_reference).toBeDefined();
      expect(clause.confidence).toBeGreaterThanOrEqual(0.0);
      expect(clause.confidence).toBeLessThanOrEqual(1.0);
      expect(['green', 'yellow', 'orange', 'red']).toContain(clause.severity_level);
      expect(['informational', 'action_required', 'deadline']).toContain(clause.finding_kind);
      expect(clause.document_version_id).toBe(verId);
    });
  });

  it('Benchmark Document 2 (Employment): extracts salary amount $120,000 and executes vector similarity retrieval', async () => {
    const buffer = Buffer.from(benchmarkEmployment, 'utf-8');
    const extraction = await extractDocument(buffer, 'text/plain', 'employment.txt');

    const chunks = chunkSections(extraction.sections, docId, verId);
    const entities = extractEntities(extraction.sections, docId, verId);

    // Verify Financial Amount Entity Extraction
    const salaryEntity = entities.find((e) => e.entity_type === 'amount');
    expect(salaryEntity).toBeDefined();
    expect(salaryEntity?.entity_value).toBe('$120,000');
    expect(salaryEntity?.source_reference).toContain('COMPENSATION AND SALARY');

    // Verify Dense Vector Similarity Retrieval for Grounded Q&A
    const retrieval = await retrieveRelevantChunks('salary compensation', chunks);
    expect(retrieval.length).toBeGreaterThan(0);
    expect(retrieval[0].relevanceScore).toBeGreaterThan(0.15);
    expect(retrieval[0].chunk.content).toContain('$120,000');
  });

  it('Benchmark Document 3 (Lease): verifies strict document_version_id scoping and zero-hallucination verbatim text grounding', async () => {
    const buffer = Buffer.from(benchmarkLease, 'utf-8');
    const extraction = await extractDocument(buffer, 'text/plain', 'residential_lease.txt');

    const chunks = chunkSections(extraction.sections, docId, verId);
    const entities = extractEntities(extraction.sections, docId, verId);
    const clauses = classifyClauses(extraction.sections, docId, verId);

    // Verify Scoping on Chunks, Entities, and Clauses (Decision 13)
    chunks.forEach((c) => expect(c.document_version_id).toBe(verId));
    entities.forEach((e) => expect(e.document_version_id).toBe(verId));
    clauses.forEach((cls) => expect(cls.document_version_id).toBe(verId));

    // STRICT Zero-Hallucination Gate Check:
    // Verifies that quoted snippet inside source_reference genuinely exists in the raw text
    clauses.forEach((cls) => {
      expect(cls.source_reference).not.toBe('');
      expect(cls.source_reference).toContain('p.');

      // Extract quoted string inside source_reference
      const quoteMatch = cls.source_reference.match(/"([^"]+)"/);
      if (quoteMatch && quoteMatch[1]) {
        const quotedTextSnippet = quoteMatch[1].replace('...', '').trim();
        // Empirical Grounding Verification: Verifies snippet is traceable to raw document text
        expect(extraction.rawText).toContain(quotedTextSnippet.substring(0, 20));
      }
    });
  });

  it('[OFFLINE/HEURISTIC] verifies AI Agent execution logs token_usage, model, latency_ms, and agent_type to ai_runs table', async () => {
    const agentResult = await runDocumentIntelligenceAgent({
      documentId: 'doc_ai_test',
      documentVersionId: 'ver_ai_v1',
      sections: [
        { id: 's1', title: 'TERMINATION', section_type: 'termination', order_index: 1, content: 'Notice of 30 days is required.', page_start: 1, page_end: 1 },
      ],
      rawText: 'TERMINATION\nNotice of 30 days is required.',
    });

    expect(agentResult.modelUsed).toBeDefined();
    expect(agentResult.aiRunLog.agent_type).toBe('document_intelligence');
    expect(agentResult.aiRunLog.token_usage).toBeGreaterThan(0);
    expect(agentResult.aiRunLog.status).toBe('completed');
  }, 30000);

  it('[LIVE] executes Document Intelligence Agent against live Gemini reasoning model and validates structural response contract', async () => {
    if (process.env.RUN_LIVE_GEMINI_TESTS !== 'true') {
      expect(true).toBe(true);
      return;
    }

    const agentResult = await runDocumentIntelligenceAgent({
      documentId: 'doc_live_b1',
      documentVersionId: 'ver_live_v1',
      sections: [
        { id: 's1', title: 'MUTUAL NON-DISCLOSURE AGREEMENT', section_type: 'definitions', order_index: 1, content: 'Made between Acme Corp and Beta LLC.', page_start: 1, page_end: 1 },
      ],
      rawText: 'MUTUAL NON-DISCLOSURE AGREEMENT\nMade between Acme Corp and Beta LLC on January 15, 2026.',
    });

    expect(agentResult.entities.length).toBeGreaterThan(0);
    agentResult.entities.forEach((ent) => {
      expect(ent.entity_name).toBeDefined();
      expect(ent.source_reference).toBeDefined();
      expect(ent.confidence).toBeGreaterThanOrEqual(0.0);
      expect(ent.confidence).toBeLessThanOrEqual(1.0);
    });
  }, 30000);
});
