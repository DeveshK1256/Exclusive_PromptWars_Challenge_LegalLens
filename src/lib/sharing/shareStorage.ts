import crypto from 'crypto';

export interface SharedLink {
  id: string; // UUID
  document_id: string;
  document_version_id: string;
  created_by_user_id: string;
  token_hash: string; // SHA-256 hash of raw token
  scope: 'summary_xray_only';
  expires_at: string;
  revoked_at: string | null;
  view_count: number;
  created_at: string;
}

export interface SharedLinkAuditRecord {
  id: string;
  shared_link_id: string;
  accessed_at: string;
  ip_address: string;
  token_hash: string;
}

const SHARED_LINKS_KEY = 'legallens_shared_links';
const SHARED_AUDITS_KEY = 'legallens_shared_audits';

// In-memory fallback store for Node.js / non-browser test environment
let inMemoryLinks: SharedLink[] = [];
let inMemoryAudits: SharedLinkAuditRecord[] = [];

/**
 * Utility to compute SHA-256 hash of raw token string.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Generates a 256-bit CSPRNG raw token (64 hex characters).
 */
export function generateRawToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getStoredSharedLinks(): SharedLink[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return inMemoryLinks;
  }
  try {
    const raw = localStorage.getItem(SHARED_LINKS_KEY);
    return raw ? JSON.parse(raw) : inMemoryLinks;
  } catch {
    return inMemoryLinks;
  }
}

export function createSharedLink(
  userId: string,
  documentId: string,
  documentVersionId: string = 'v1',
  expiryDays: number = 7
): { rawToken: string; link: SharedLink } {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

  const link: SharedLink = {
    id: `sh_${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}`,
    document_id: documentId,
    document_version_id: documentVersionId,
    created_by_user_id: userId,
    token_hash: tokenHash,
    scope: 'summary_xray_only',
    expires_at: expiresAt,
    revoked_at: null,
    view_count: 0,
    created_at: new Date().toISOString(),
  };

  inMemoryLinks = [link, ...inMemoryLinks];

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SHARED_LINKS_KEY, JSON.stringify(inMemoryLinks));
    } catch {
      // Ignore
    }
  }

  return { rawToken, link };
}

export function validateAndAccessSharedLink(rawToken: string, ipAddress: string = '127.0.0.1'): SharedLink | null {
  const incomingHash = hashToken(rawToken);
  const links = getStoredSharedLinks();

  const linkIndex = links.findIndex((l) => l.token_hash === incomingHash);
  if (linkIndex === -1) return null;

  const link = links[linkIndex];

  // Expiration check
  if (new Date() > new Date(link.expires_at)) return null;

  // Revocation check
  if (link.revoked_at !== null) return null;

  // Increment view count & log audit
  link.view_count += 1;
  links[linkIndex] = link;
  inMemoryLinks = links;

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SHARED_LINKS_KEY, JSON.stringify(links));

      // Audit log
      const auditsRaw = localStorage.getItem(SHARED_AUDITS_KEY);
      const audits: SharedLinkAuditRecord[] = auditsRaw ? JSON.parse(auditsRaw) : inMemoryAudits;
      audits.push({
        id: `aud_${Math.random().toString(36).substring(2)}`,
        shared_link_id: link.id,
        accessed_at: new Date().toISOString(),
        ip_address: ipAddress,
        token_hash: incomingHash,
      });
      inMemoryAudits = audits;
      localStorage.setItem(SHARED_AUDITS_KEY, JSON.stringify(audits));
    } catch {
      // Ignore
    }
  }

  return link;
}

export function revokeSharedLink(userId: string, linkId: string): boolean {
  const links = getStoredSharedLinks();
  const link = links.find((l) => l.id === linkId);

  // Strict RLS ownership check: requesting user must match creator
  if (!link || link.created_by_user_id !== userId) {
    return false;
  }

  link.revoked_at = new Date().toISOString();
  inMemoryLinks = links;

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SHARED_LINKS_KEY, JSON.stringify(links));
    } catch {
      // Ignore
    }
  }

  return true;
}
