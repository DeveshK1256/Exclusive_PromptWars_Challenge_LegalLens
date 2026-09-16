// LegalLens AI Configuration & Limits (Section 6.2, skills/document-intelligence.md, skills/security-and-grounding.md)

export const DOCUMENT_CONFIG = {
  // Max file size in MB (configurable via ENV or default to 25 MB)
  maxFileSizeMb: Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || 25),

  // Max pages cap before informing user of partial-analysis limits
  maxPagesCap: Number(process.env.NEXT_PUBLIC_MAX_PAGES_CAP || 200),

  // Max token cap (~150k tokens)
  maxTokensCap: Number(process.env.NEXT_PUBLIC_MAX_TOKENS_CAP || 150000),

  // Per-document AI token budget alert threshold
  tokenBudgetAlertThreshold: Number(process.env.NEXT_PUBLIC_TOKEN_BUDGET_THRESHOLD || 500000),

  // Soft delete retention window in days (default: 30 days)
  retentionWindowDays: Number(process.env.RETENTION_WINDOW_DAYS || 30),

  // Minimum cosine similarity relevance threshold for Grounded Q&A retrieval
  qaRelevanceThreshold: Number(process.env.QA_RELEVANCE_THRESHOLD || 0.25),

  // Supported MIME types and file extensions
  allowedMimeTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],

  allowedExtensions: ['.pdf', '.docx', '.txt'],
};

export function getMaxFileSizeBytes(): number {
  return DOCUMENT_CONFIG.maxFileSizeMb * 1024 * 1024;
}

/**
 * Sanitizes filename to protect against path traversal attacks (e.g. ../../etc/passwd)
 */
export function sanitizeFilename(originalFilename: string): string {
  // Extract basename to strip directory paths
  const basename = originalFilename.split(/[/\\]/).pop() || 'document.pdf';
  
  // Strip control characters, null bytes, and path traversal tokens
  const sanitized = basename
    .replace(/\0/g, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');

  // Fallback if sanitization strips everything
  if (!sanitized || sanitized.startsWith('.')) {
    return `document_${Date.now()}.pdf`;
  }

  return sanitized;
}

export function validateFileMetadata(filename: string, mimeType: string, fileSize: number): { valid: boolean; error?: string } {
  const sanitized = sanitizeFilename(filename);
  const ext = '.' + sanitized.split('.').pop()?.toLowerCase();
  
  if (!DOCUMENT_CONFIG.allowedExtensions.includes(ext) && !DOCUMENT_CONFIG.allowedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `Unsupported file format '${ext || mimeType}'. LegalLens AI supports PDF, DOCX, and TXT files.`,
    };
  }

  const maxBytes = getMaxFileSizeBytes();
  if (fileSize > maxBytes) {
    return {
      valid: false,
      error: `File size (${(fileSize / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum limit of ${DOCUMENT_CONFIG.maxFileSizeMb} MB.`,
    };
  }

  if (fileSize === 0) {
    return {
      valid: false,
      error: 'File is empty (0 bytes). Please upload a valid document with content.',
    };
  }

  return { valid: true };
}

export { sanitizeJurisdictionInference } from './comparison/comparisonAgent';

