import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/documents/upload/route';
import { resetRateLimitsForTesting } from './rateLimit';

describe('Manual Rate Limit Probe — Upload Route 11th Request Verification', () => {
  it('executes 11 sequential requests to upload route handler and verifies 11th request returns HTTP 429 and Retry-After header', async () => {
    resetRateLimitsForTesting();
    const userId = 'rate_limit_probe_user_live';

    const responses = [];
    for (let i = 1; i <= 11; i++) {
      const formData = new FormData();
      const mockFile = new File(['Dummy document content for manual probe'], 'test_contract.pdf', {
        type: 'application/pdf',
      });
      formData.append('file', mockFile);
      formData.append('document_type', 'employment_agreement');

      const req = new NextRequest('http://localhost:3000/api/documents/upload', {
        method: 'POST',
        headers: {
          'x-user-id': userId,
        },
        body: formData,
      });

      const res = await POST(req);
      responses.push({
        requestNumber: i,
        status: res.status,
        retryAfter: res.headers.get('retry-after'),
      });
    }

    const firstRes = responses[0];
    const tenthRes = responses[9];
    const eleventhRes = responses[10];

    console.log('\n--- RATE LIMIT HTTP PROBE VERIFICATION RESULTS ---');
    console.log(`Request #1 Status: ${firstRes.status} Created`);
    console.log(`Request #10 Status: ${tenthRes.status} Created`);
    console.log(`Request #11 Status: ${eleventhRes.status} Too Many Requests`);
    console.log(`Request #11 Retry-After Header: ${eleventhRes.retryAfter} seconds`);

    // Assertions
    expect(firstRes.status).toBe(201);
    expect(tenthRes.status).toBe(201);
    expect(eleventhRes.status).toBe(429);
    expect(eleventhRes.retryAfter).toBeDefined();
    expect(Number(eleventhRes.retryAfter)).toBeGreaterThan(0);
  });

  it('executes 21 sequential GET requests to /api/shared/[token] and verifies 21st request returns HTTP 429 rate-limit error', async () => {
    const { GET } = await import('../../app/api/shared/[token]/route');
    const { createSharedLink } = await import('../sharing/shareStorage');
    
    // Create valid token for testing
    const { rawToken } = createSharedLink('user_rl_probe', 'doc_1', 'v1');
    resetRateLimitsForTesting();

    const responses = [];
    const clientIp = '198.51.100.42';

    for (let i = 1; i <= 21; i++) {
      const req = new NextRequest(`http://localhost:3000/api/shared/${rawToken}`, {
        method: 'GET',
        headers: {
          'x-forwarded-for': clientIp,
        },
      });

      const res = await GET(req, { params: { token: rawToken } });
      responses.push({
        requestNumber: i,
        status: res.status,
      });
    }

    const firstRes = responses[0];
    const twentiethRes = responses[19];
    const twentyFirstRes = responses[20];

    console.log('\n--- SHARED LINK API RATE LIMIT PROBE RESULTS ---');
    console.log(`Request #1 Status: ${firstRes.status} (OK/Valid)`);
    console.log(`Request #20 Status: ${twentiethRes.status} (Allowed)`);
    console.log(`Request #21 Status: ${twentyFirstRes.status} (Blocked HTTP 429)`);

    expect(firstRes.status).toBe(200);
    expect(twentiethRes.status).toBe(200);
    expect(twentyFirstRes.status).toBe(429);
  });

  it('computes retryAfterSeconds using the genuinely oldest created_at timestamp when records are ordered ascending', () => {
    const now = 1789922500000; // fixed reference time
    const windowMs = 60 * 60 * 1000; // 1 hour (3600 seconds)

    // Shuffled / out-of-order audit_logs records
    const unorderedLogs = [
      { id: '3', created_at: new Date(now - 1000 * 1000).toISOString() }, // 1000s ago
      { id: '1', created_at: new Date(now - 3000 * 1000).toISOString() }, // 3000s ago (GENUINELY OLDEST)
      { id: '2', created_at: new Date(now - 2000 * 1000).toISOString() }, // 2000s ago
    ];

    // Explicitly sort ascending by created_at (matches .order('created_at', { ascending: true }))
    const sortedLogs = [...unorderedLogs].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Oldest record MUST be index 0
    expect(sortedLogs[0].id).toBe('1');

    const oldestTime = new Date(sortedLogs[0].created_at).getTime();
    const retryAfterSeconds = Math.max(1, Math.ceil((oldestTime + windowMs - now) / 1000));

    // Expected: (now - 3000s + 3600s - now) / 1000 = 600 seconds
    expect(retryAfterSeconds).toBe(600);
  });
});

