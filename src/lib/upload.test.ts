import { describe, it, expect } from 'vitest';
import { validateFileMetadata, sanitizeFilename, DOCUMENT_CONFIG } from './config';
import { calculateFileHash } from './crypto';

describe('Sprint 2 — Document Upload & Validation Suite', () => {
  it('validates valid PDF file within 25 MB limit', () => {
    const res = validateFileMetadata('employment_contract.pdf', 'application/pdf', 10 * 1024 * 1024);
    expect(res.valid).toBe(true);
    expect(res.error).toBeUndefined();
  });

  it('validates valid DOCX file', () => {
    const res = validateFileMetadata('lease_agreement.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 5 * 1024 * 1024);
    expect(res.valid).toBe(true);
  });

  it('validates valid TXT file', () => {
    const res = validateFileMetadata('service_terms.txt', 'text/plain', 500 * 1024);
    expect(res.valid).toBe(true);
  });

  it('sanitizes malicious path-traversal filenames safely (e.g. ../../etc/passwd)', () => {
    const malicious1 = '../../../../etc/passwd.pdf';
    const safe1 = sanitizeFilename(malicious1);
    expect(safe1).toBe('passwd.pdf');
    expect(safe1).not.toContain('..');
    expect(safe1).not.toContain('/');

    const malicious2 = '..\\..\\windows\\system32\\cmd.exe.docx';
    const safe2 = sanitizeFilename(malicious2);
    expect(safe2).toBe('cmd.exe.docx');
    expect(safe2).not.toContain('\\');

    const malicious3 = '<script>alert(1)</script>.pdf';
    const safe3 = sanitizeFilename(malicious3);
    expect(safe3).not.toContain('<script>');
    expect(safe3).not.toContain('>');

    const malicious4 = 'file with special chars !@#$%^&*().txt';
    const safe4 = sanitizeFilename(malicious4);
    expect(safe4).not.toContain('!');
    expect(safe4).not.toContain('$');
  });

  it('rejects unsupported file extensions (.exe, .zip, .jpg)', () => {
    const resExecutable = validateFileMetadata('malicious.exe', 'application/octet-stream', 1024);
    expect(resExecutable.valid).toBe(false);
    expect(resExecutable.error).toContain('Unsupported file format');

    const resArchive = validateFileMetadata('contract.zip', 'application/zip', 1024);
    expect(resArchive.valid).toBe(false);
  });

  it('rejects oversized files exceeding configurable MAX_FILE_SIZE_MB limit (25 MB default)', () => {
    const maxBytes = DOCUMENT_CONFIG.maxFileSizeMb * 1024 * 1024;
    const oversizedBytes = maxBytes + 1024; // 25.001 MB

    const res = validateFileMetadata('huge_document.pdf', 'application/pdf', oversizedBytes);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('exceeds the maximum limit of 25 MB');
  });

  it('rejects empty files (0 bytes)', () => {
    const res = validateFileMetadata('empty.pdf', 'application/pdf', 0);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('File is empty');
  });

  it('computes deterministic SHA-256 file_hash for duplicate detection', () => {
    const sampleBuffer = Buffer.from('LegalLens AI Contract Content Verification');
    const hash1 = calculateFileHash(sampleBuffer);
    const hash2 = calculateFileHash(sampleBuffer);

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/); // 64-char SHA-256 hex string
  });
});
