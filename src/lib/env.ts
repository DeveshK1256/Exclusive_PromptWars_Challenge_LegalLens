import { z } from 'zod';

// Helper to load .env.local in server/Node environment if not already populated in process.env
function loadEnvLocal() {
  if (typeof window === 'undefined' && (!process.env['GEMINI_API_KEY'] || process.env['GEMINI_API_KEY'] === 'dummy_gemini_key')) {
    try {
      const req = eval('require');
      const fs = req('fs');
      const path = req('path');
      const envPath = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const matchKey = content.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/);
        if (matchKey && matchKey[1]) {
          process.env['GEMINI_API_KEY'] = matchKey[1];
        }
      }
    } catch {
      // Ignore reading error
    }
  }
}

loadEnvLocal();

export const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({ message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP/HTTPS URL' }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10, { message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY must be provided' }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(customEnv?: Record<string, string | undefined>): Env {
  const envToValidate = customEnv || {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  };

  const result = envSchema.safeParse(envToValidate);

  if (!result.success) {
    const formattedErrors = result.error.format();
    throw new Error(
      `[LegalLens ENV ERROR] Invalid environment configuration:\n${JSON.stringify(formattedErrors, null, 2)}`
    );
  }

  return result.data;
}

export const env = (() => {
  try {
    return validateEnv();
  } catch {
    // Development/test fallback when env vars are not set in local CLI environment
    return envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_service_key',
      GEMINI_API_KEY: 'dummy_gemini_key',
    });
  }
})();
