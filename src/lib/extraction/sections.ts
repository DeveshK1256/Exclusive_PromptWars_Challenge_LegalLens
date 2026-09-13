import { ExtractedSection } from './types';

/**
 * Detects structural sections, articles, and clauses in legal document text
 * and attributes page_start and page_end per section accurately.
 */
export function detectSections(text: string, pageBreakMarker = '\f'): ExtractedSection[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Split text by page break markers if present
  const pages = text.split(pageBreakMarker);
  const sections: ExtractedSection[] = [];
  let currentOrder = 0;

  let currentTitle: string | null = null;
  let currentContent: string[] = [];
  let startPage = 1;
  let lastContentPage = 1;

  pages.forEach((pageContent, pageIdx) => {
    const pageNum = pageIdx + 1;
    const lines = pageContent.split('\n');

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const isHeader = isSectionHeader(trimmed);

      if (isHeader) {
        // Save preceding section if content or title exists
        if (currentTitle || currentContent.length > 0) {
          sections.push({
            id: `sec_${sections.length + 1}`,
            title: currentTitle || `Section ${sections.length + 1}`,
            section_type: inferSectionType(currentTitle),
            order_index: ++currentOrder,
            content: currentContent.join('\n').trim(),
            page_start: startPage,
            page_end: lastContentPage,
          });
          currentContent = [];
        }

        currentTitle = trimmed;
        startPage = pageNum;
        lastContentPage = pageNum;
      } else {
        currentContent.push(line);
        lastContentPage = pageNum;
      }
    });
  });

  // Save the final section
  if (currentTitle || currentContent.length > 0) {
    sections.push({
      id: `sec_${sections.length + 1}`,
      title: currentTitle || `Section ${sections.length + 1}`,
      section_type: inferSectionType(currentTitle),
      order_index: ++currentOrder,
      content: currentContent.join('\n').trim(),
      page_start: startPage,
      page_end: lastContentPage,
    });
  }

  // Fallback if no sections were created
  if (sections.length === 0) {
    sections.push({
      id: 'sec_1',
      title: 'Main Content',
      section_type: 'general',
      order_index: 1,
      content: text.trim(),
      page_start: 1,
      page_end: Math.max(1, pages.length),
    });
  }

  return sections;
}

function isSectionHeader(line: string): boolean {
  if (line.length > 120) return false;
  const upper = line.toUpperCase();
  return (
    upper.startsWith('ARTICLE') ||
    upper.startsWith('SECTION') ||
    upper.startsWith('CLAUSE') ||
    upper.startsWith('PARAGRAPH') ||
    /^\d+\.[\d\.]*/.test(line) ||
    (upper === line && line.length > 4 && line.length < 80)
  );
}

function inferSectionType(title: string | null): string {
  if (!title) return 'section';
  const lower = title.toLowerCase();

  if (lower.includes('article')) return 'article';
  if (lower.includes('section')) return 'section';
  if (lower.includes('clause')) return 'clause';
  if (lower.includes('definition')) return 'definitions';
  if (lower.includes('term') || lower.includes('termination')) return 'termination';
  if (lower.includes('payment') || lower.includes('compensation') || lower.includes('financial')) return 'financial';
  if (lower.includes('confidential')) return 'confidentiality';
  if (lower.includes('governing law') || lower.includes('dispute')) return 'dispute';

  return 'section';
}
