import { describe, it, expect } from 'vitest';
import { extractDocument } from './extraction/extractor';
import { normalizeText } from './extraction/normalizer';

describe('Sprint 3 — Document Extraction Test Suite', () => {
  it('extracts structured text with sections and page_start/page_end attribution', async () => {
    const textContent = `ARTICLE 1: DEFINITIONS\nIn this Agreement, the following terms shall have the meanings set forth below.\n\fSECTION 2: OBLIGATIONS OF THE PARTIES\nThe Employee agrees to render professional services diligently.\n\fCLAUSE 3: TERMINATION\nEither party may terminate this agreement upon 30 days written notice.`;
    const buffer = Buffer.from(textContent, 'utf-8');

    const result = await extractDocument(buffer, 'text/plain', 'employment_agreement.txt');

    expect(result.status).toBe('completed');
    expect(result.sections.length).toBeGreaterThanOrEqual(3);
    expect(result.metadata.pageCount).toBe(3);

    const section1 = result.sections[0];
    expect(section1.title).toContain('ARTICLE 1');
    expect(section1.page_start).toBe(1);
    expect(section1.page_end).toBe(1);

    const section2 = result.sections[1];
    expect(section2.title).toContain('SECTION 2');
    expect(section2.page_start).toBe(2);
    expect(section2.page_end).toBe(2);

    const section3 = result.sections[2];
    expect(section3.title).toContain('CLAUSE 3');
    expect(section3.page_start).toBe(3);
    expect(section3.page_end).toBe(3);
  });

  it('flags un-paginated plain text files as page_estimate: true for downstream confidence scaling', async () => {
    const plainText = `SECTION 1: OVERVIEW\nThis is a sample plain text contract document content.\nSECTION 2: TERMS\nPayment terms shall be net 30 days.`;
    const buffer = Buffer.from(plainText, 'utf-8');
    const result = await extractDocument(buffer, 'text/plain', 'contract.txt');

    expect(result.status).toBe('completed');
    expect(result.metadata.isPageEstimate).toBe(true);
    expect(result.sections[0].is_page_estimate).toBe(true);
  });

  it('tests near-ceiling large document (~600k chars / ~150k tokens) performance and token tracking', async () => {
    const paragraph = `SECTION 1: GOVERNING TERMS AND OBLIGATIONS\nThe Company shall provide equal employment opportunities and adhere to applicable statutory regulations and compliance policies.\n`;
    const nearCapText = paragraph.repeat(4500); // ~630,000 chars / ~157,500 tokens
    const buffer = Buffer.from(nearCapText, 'utf-8');

    const start = Date.now();
    const result = await extractDocument(buffer, 'text/plain', 'near_cap_document.txt');
    const duration = Date.now() - start;

    expect(result.status).toBe('completed');
    expect(result.metadata.characterCount).toBeGreaterThan(600000);
    expect(result.metadata.tokenCount).toBeGreaterThan(150000);
    expect(duration).toBeLessThan(5000); // Must extract under 5 seconds
  });

  it('handles empty files gracefully without crashing (0 bytes)', async () => {
    const emptyBuffer = Buffer.from('', 'utf-8');
    const result = await extractDocument(emptyBuffer, 'application/pdf', 'empty.pdf');

    expect(result.status).toBe('failed');
    expect(result.error).toContain('Document file is empty');
    expect(result.sections).toHaveLength(0);
  });

  it('handles corrupt files gracefully without hanging or crashing', async () => {
    const corruptBuffer = Buffer.from('NOT_A_REAL_PDF_HEADER_CONTENT_GARBAGE_XYZ', 'utf-8');
    const result = await extractDocument(corruptBuffer, 'application/pdf', 'corrupt.pdf');

    expect(result.status).toBe('failed');
    expect(result.error).toContain('Corrupt or unreadable PDF document');
  });

  it('normalizes CRLF, smart quotes, em-dashes, and non-breaking spaces', () => {
    const dirty = "SECTION 1\r\n\u201CHello World\u201D \u2014 \u2018Test\u2019\u00A0content.\r\n\r\n\r\nFinal Line.";
    const clean = normalizeText(dirty);

    expect(clean).toContain('"Hello World" - \'Test\' content.');
    expect(clean).not.toContain('\r');
    expect(clean).not.toContain('\u201C');
  });
});
