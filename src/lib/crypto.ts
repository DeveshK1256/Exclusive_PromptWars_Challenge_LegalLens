import { createHash } from 'crypto';

/**
 * Calculates SHA-256 checksum hash of file buffer for duplicate detection
 */
export function calculateFileHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}
