import { recordSecurityAuditLog } from './auditLog';

export interface RateLimitConfig {
  uploadMaxPerHour: number;
  aiRouteMaxPerMinute: number;
  tokenBudgetPerDocument: number;
}

export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  uploadMaxPerHour: 10,
  aiRouteMaxPerMinute: 20,
  tokenBudgetPerDocument: 500000,
};

interface WindowEntry {
  timestamps: number[];
}

// In-memory sliding window store
const uploadWindows = new Map<string, WindowEntry>();
const aiRouteWindows = new Map<string, WindowEntry>();
const documentTokenUsage = new Map<string, number>();

/**
 * Checks and updates rate limits for uploads (per hour) or AI API routes (per minute).
 * Returns status, remaining quota, and retry-after window in seconds if blocked.
 */
export async function checkRateLimit(
  identifier: string,
  limitType: 'upload' | 'ai_route',
  config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const now = Date.now();
  const windowMs = limitType === 'upload' ? 60 * 60 * 1000 : 60 * 1000; // 1 hr vs 1 min
  const maxAllowed = limitType === 'upload' ? config.uploadMaxPerHour : config.aiRouteMaxPerMinute;
  const store = limitType === 'upload' ? uploadWindows : aiRouteWindows;

  let entry = store.get(identifier);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(identifier, entry);
  }

  // Filter timestamps within the sliding window
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

  // Database query for multi-instance serverless persistence in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    try {
      const { createAdminClient } = await import('../supabase/admin');
      const admin = createAdminClient();
      const windowStart = new Date(now - windowMs).toISOString();
      const { data: dbLogs } = await admin
        .from('audit_logs')
        .select('id, created_at')
        .eq('resource_type', limitType)
        .eq('user_id', identifier)
        .eq('action', 'rate_limit_hit')
        .gte('created_at', windowStart)
        .order('created_at', { ascending: true });

      if (dbLogs && dbLogs.length >= maxAllowed) {
        const oldestTime = new Date(dbLogs[0].created_at).getTime();
        const retryAfterSeconds = Math.max(1, Math.ceil((oldestTime + windowMs - now) / 1000));

        await recordSecurityAuditLog(identifier, 'rate_limit_exceeded', limitType, {
          identifier,
          limitType,
          attemptsInWindow: dbLogs.length,
          retryAfterSeconds,
        });

        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds,
        };
      }
    } catch {
      // Fallback to in-memory window tracking if DB query fails
    }
  }

  if (entry.timestamps.length >= maxAllowed) {
    const oldestTimestamp = entry.timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));

    // Record security audit log for rate limit violation (Section 6.4 / Decision 9)
    await recordSecurityAuditLog(identifier, 'rate_limit_exceeded', limitType, {
      identifier,
      limitType,
      attemptsInWindow: entry.timestamps.length,
      retryAfterSeconds,
    });

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  // Record this hit (in-memory + database persistent audit log for cold starts)
  entry.timestamps.push(now);
  const remaining = maxAllowed - entry.timestamps.length;

  if (process.env.NODE_ENV !== 'test') {
    await recordSecurityAuditLog(identifier, 'rate_limit_hit', limitType, {
      identifier,
      limitType,
      requestCountInWindow: entry.timestamps.length,
    });
  }

  return {
    allowed: true,
    remaining,
    retryAfterSeconds: 0,
  };
}

/**
 * Tracks AI token consumption per document and checks against the alert threshold (default 500k tokens).
 */
export async function trackDocumentTokenUsage(
  documentId: string,
  tokensUsed: number,
  userId: string = 'system',
  config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG
): Promise<{ totalTokens: number; thresholdExceeded: boolean }> {
  const currentTotal = (documentTokenUsage.get(documentId) || 0) + tokensUsed;
  documentTokenUsage.set(documentId, currentTotal);

  const thresholdExceeded = currentTotal > config.tokenBudgetPerDocument;

  if (thresholdExceeded) {
    await recordSecurityAuditLog(userId, 'token_budget_exceeded', 'document', {
      documentId,
      tokensUsed,
      totalTokens: currentTotal,
      threshold: config.tokenBudgetPerDocument,
    });
  }

  return {
    totalTokens: currentTotal,
    thresholdExceeded,
  };
}

/**
 * Retrieves accumulated token usage for a document
 */
export function getDocumentTokenUsage(documentId: string): number {
  return documentTokenUsage.get(documentId) || 0;
}

/**
 * Resets rate limits and token tracking (primarily for testing environment isolation)
 */
export function resetRateLimitsForTesting(): void {
  uploadWindows.clear();
  aiRouteWindows.clear();
  documentTokenUsage.clear();
}
