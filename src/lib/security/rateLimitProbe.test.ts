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
});
