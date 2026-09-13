/**
 * Text normalization utility for LegalLens AI (Sprint 3)
 * Normalizes CRLF -> LF, replaces smart quotes, unifies dashes, strips control characters while preserving page breaks (\f)
 */
export function normalizeText(text: string): string {
  if (!text) return '';

  return text
    // Normalize newlines to LF
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Strip null bytes and non-printable control characters (preserving newlines, tabs, and form feeds \x0C / \f)
    .replace(/[\x00-\x08\x0B\x0E-\x1F\x7F]/g, '')
    // Replace smart single/double quotes with standard ASCII quotes
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // Unify em-dashes and en-dashes to standard hyphen/dash
    .replace(/[\u2013\u2014]/g, '-')
    // Replace non-breaking spaces with standard space
    .replace(/\u00A0/g, ' ')
    // Collapse multiple consecutive blank lines (>2) to max 2
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Estimates token count for raw/normalized legal text (~4 chars per token average)
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}
