import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

// Mock Supabase Server Client inside middleware
vi.mock('@supabase/ssr', () => ({
  createServerClient: (_url: string, _key: string, options: { cookies: { getAll: () => Array<{ name: string; value: string }> } }) => {
    const cookies = options.cookies.getAll();
    const authCookie = cookies.find((c) => c.name === 'sb-access-token');

    return {
      auth: {
        getUser: vi.fn(async () => {
          if (authCookie && authCookie.value === 'valid_user_jwt') {
            return { data: { user: { id: 'user_123', email: 'auth@example.com' } }, error: null };
          }
          return { data: { user: null }, error: null };
        }),
      },
    };
  },
}));

describe('Middleware & Protected Routes Test Suite', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('redirects unauthenticated request to /dashboard to /login', async () => {
    const req = new NextRequest('https://legallens.app/dashboard');
    const res = await middleware(req);

    expect(res.status).toBe(307); // Temporary Redirect
    expect(res.headers.get('location')).toBe('https://legallens.app/login');
  });

  it('redirects unauthenticated request to /documents to /login', async () => {
    const req = new NextRequest('https://legallens.app/documents');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://legallens.app/login');
  });

  it('redirects unauthenticated request to /compare to /login', async () => {
    const req = new NextRequest('https://legallens.app/compare');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://legallens.app/login');
  });

  it('allows authenticated request with valid auth cookie to access /dashboard', async () => {
    const req = new NextRequest('https://legallens.app/dashboard', {
      headers: {
        cookie: 'sb-access-token=valid_user_jwt',
      },
    });
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('allows unauthenticated access to public root route /', async () => {
    const req = new NextRequest('https://legallens.app/');
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });
});
