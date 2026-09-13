import { describe, it, expect } from 'vitest';
import { validateEnv, env } from './env';

describe('Environment Validation Suite', () => {
  it('succeeds when valid environment variables are provided', () => {
    const validConfig = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid_anon_key_for_testing',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid_service_key',
      GEMINI_API_KEY: 'valid_gemini_key_12345',
    };

    const parsed = validateEnv(validConfig);
    expect(parsed.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test-project.supabase.co');
    expect(parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid_anon_key_for_testing');
  });

  it('fails fast when NEXT_PUBLIC_SUPABASE_URL is not a valid URL', () => {
    const invalidConfig = {
      NEXT_PUBLIC_SUPABASE_URL: 'invalid-url-string',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid_anon_key',
    };

    expect(() => validateEnv(invalidConfig)).toThrow('[LegalLens ENV ERROR]');
  });

  it('fails fast when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or too short', () => {
    const missingKeyConfig = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'short',
    };

    expect(() => validateEnv(missingKeyConfig)).toThrow('[LegalLens ENV ERROR]');
  });

  it('provides default fallback env for development/testing context', () => {
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
  });
});
