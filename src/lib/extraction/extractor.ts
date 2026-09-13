import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { normalizeText, estimateTokenCount } from './normalizer';
import { detectSections } from './sections';
import { ExtractionResult } from './types';

/**
 * Main document extraction engine for LegalLens AI (Sprint 3)
 * Extracts text, structural sections, page bounds, and embedded PDF/DOCX metadata.
 */
export async function extractDocument(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<ExtractionResult> {
  if (!buffer || buffer.length === 0) {
    return {
      status: 'failed',
      rawText: '',
      normalizedText: '',
      sections: [],
      metadata: { pageCount: 0, characterCount: 0, tokenCount: 0, isPageEstimate: false },
      error: 'Document file is empty (0 bytes).',
    };
  }

  const ext = '.' + filename.split('.').pop()?.toLowerCase();

  try {
    let rawText = '';
    let pageCount = 1;
    let isPageEstimate = false;
    let metaTitle: string | null = null;
    let metaAuthor: string | null = null;
    let metaCreationDate: string | null = null;

    // 1. PDF Extraction
    if (ext === '.pdf' || mimeType === 'application/pdf') {
      try {
        const pdfData = await pdfParse(buffer);
        rawText = pdfData.text || '';
        pageCount = pdfData.numpages || 1;
        isPageEstimate = false; // Native PDF pages

        // Embedded PDF metadata extraction
        if (pdfData.info) {
          metaTitle = pdfData.info.Title || null;
          metaAuthor = pdfData.info.Author || null;
          metaCreationDate = pdfData.info.CreationDate || null;
        }
      } catch (pdfErr: unknown) {
        return {
          status: 'failed',
          rawText: '',
          normalizedText: '',
          sections: [],
          metadata: { pageCount: 0, characterCount: 0, tokenCount: 0, isPageEstimate: false },
          error: `Corrupt or unreadable PDF document: ${pdfErr instanceof Error ? pdfErr.message : 'Invalid PDF structure'}`,
        };
      }
    }
    // 2. DOCX Extraction
    else if (ext === '.docx' || mimeType.includes('wordprocessingml')) {
      try {
        const docxData = await mammoth.extractRawText({ buffer });
        rawText = docxData.value || '';
        // DOCX has no native pages: estimate ~3000 chars / ~500 words per page
        pageCount = Math.max(1, Math.ceil(rawText.length / 3000));
        isPageEstimate = true; // Flagged as heuristic page estimate
      } catch (docxErr: unknown) {
        return {
          status: 'failed',
          rawText: '',
          normalizedText: '',
          sections: [],
          metadata: { pageCount: 0, characterCount: 0, tokenCount: 0, isPageEstimate: true },
          error: `Corrupt or unreadable DOCX document: ${docxErr instanceof Error ? docxErr.message : 'Invalid DOCX structure'}`,
        };
      }
    }
    // 3. TXT Extraction
    else if (ext === '.txt' || mimeType === 'text/plain') {
      try {
        rawText = buffer.toString('utf-8');
        const formFeedPages = rawText.split('\f').length;
        pageCount = formFeedPages > 1 ? formFeedPages : Math.max(1, Math.ceil(rawText.length / 3000));
        isPageEstimate = formFeedPages === 1;
      } catch (txtErr: unknown) {
        return {
          status: 'failed',
          rawText: '',
          normalizedText: '',
          sections: [],
          metadata: { pageCount: 0, characterCount: 0, tokenCount: 0, isPageEstimate: true },
          error: `Unreadable plain text document: ${txtErr instanceof Error ? txtErr.message : 'Encoding error'}`,
        };
      }
    } else {
      return {
        status: 'failed',
        rawText: '',
        normalizedText: '',
        sections: [],
        metadata: { pageCount: 0, characterCount: 0, tokenCount: 0, isPageEstimate: false },
        error: `Unsupported file format for extraction: '${ext || mimeType}'`,
      };
    }

    const normalizedText = normalizeText(rawText);
    if (!normalizedText || normalizedText.trim().length === 0) {
      return {
        status: 'failed',
        rawText,
        normalizedText: '',
        sections: [],
        metadata: { pageCount, characterCount: 0, tokenCount: 0, isPageEstimate },
        error: 'Extracted text content is empty or contains only unreadable control characters.',
      };
    }

    // Section Detection and Page Range Attribution
    const rawSections = detectSections(normalizedText);
    const sections = rawSections.map((s) => ({ ...s, is_page_estimate: isPageEstimate }));

    const characterCount = normalizedText.length;
    const tokenCount = estimateTokenCount(normalizedText);

    return {
      status: 'completed',
      rawText,
      normalizedText,
      sections,
      metadata: {
        pageCount,
        characterCount,
        tokenCount,
        isPageEstimate,
        title: metaTitle,
        author: metaAuthor,
        creationDate: metaCreationDate,
      },
    };
  } catch (globalErr: unknown) {
    return {
      status: 'failed',
      rawText: '',
      normalizedText: '',
      sections: [],
      metadata: { pageCount: 0, characterCount: 0, tokenCount: 0, isPageEstimate: false },
      error: `Extraction failed: ${globalErr instanceof Error ? globalErr.message : 'Unknown processing error'}`,
    };
  }
}
