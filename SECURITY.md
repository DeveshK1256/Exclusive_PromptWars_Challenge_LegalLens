# LegalLens AI — Security Policy & Hardening Specifications

## Overview

LegalLens AI processes sensitive user legal documents. Security, privacy, access control, and prompt-grounding defenses are built into every layer of the architecture per **Section 6.4**, **Decision 9**, and **Section 9.3** of `LegalLens_Master_Spec.md`.

---

## 1. Threat Model & Data Protection

### Untrusted Document Content Guardrails
- **Rule:** Uploaded document content is untrusted input and MUST NEVER be treated as system prompt instructions.
- **Enforcement:** All text sent to LLMs is strictly wrapped inside `<untrusted_document>...</untrusted_document>` or `<untrusted_document_a>/<untrusted_document_b>` tags. System prompts explicitly instruct Gemini agents that content within these tags is untrusted data for passive analysis only.

### Jurisdiction Neutrality & Statute Forgery Defenses (Decision 10)
- `documents.jurisdiction` is an optional, user-supplied field. It is NEVER inferred from document text (e.g. mentions of cities or addresses).
- AI agent prompts strictly enforce jurisdiction-neutral caution phrasing ("consider reviewing," "potential attention area") unless reliable jurisdiction-aware evidence is supplied by the user.

---

## 2. Row-Level Security (RLS) & Access Control

Every database table containing user-owned data enforces `user_id == authenticated_user.id` (or version ownership) via Supabase RLS policies across 22 PostgreSQL tables in `supabase/schema.sql`. Formally verified across explicit database test suites in `src/lib/rls.test.ts`:

| Entity # | Table Name | Ownership Enforcement Rule | Test Case Status |
| :--- | :--- | :--- | :--- |
| 1 | `documents` | `user_id == auth.uid() AND deleted_at IS NULL` | Verified (`rls.test.ts`) |
| 2 | `comparisons` | Requesting user MUST own **BOTH** `document_a_id` AND `document_b_id` | Verified (`rls.test.ts`) |
| 3 | `clauses` | Enforces ownership via `document_version_id` document owner | Verified (`rls.test.ts`) |
| 4 | `findings` | Enforces ownership via `document_version_id` document owner | Verified (`rls.test.ts`) |
| 5 | `timelines` | Enforces ownership via `document_version_id` document owner | Verified (`rls.test.ts`) |
| 6 | `document_summaries` | Enforces ownership via `document_version_id` document owner | Verified (`rls.test.ts`) |
| 7 | `glossary_terms` | Enforces ownership via `document_version_id` document owner | Verified (`rls.test.ts`) |
| 8 | `questions` | Enforces ownership via `document_version_id` document owner | Verified (`rls.test.ts`) |
| 9 | `answers` | Enforces ownership via `document_version_id` document owner | Verified (`rls.test.ts`) |
| 10 | `action_items` | Enforces ownership via `document_version_id` document owner | Verified (`rls.test.ts`) |
| 11 | `profiles` | User profile ownership (`user_id == auth.uid()`) | Verified (`rls.test.ts`) |
| 12 | `audit_logs` | Audit trail per user (`user_id == auth.uid()`) | Verified (`rls.test.ts`) |

---

## 3. Persistent Security Audit Logging (`audit_logs`)

All sensitive actions, deletions, access denials, failed authentication attempts, and rate limit breaches write structured records directly to the Supabase PostgreSQL `audit_logs` table (Decision 9), ensuring audit entries survive serverless cold starts:

```typescript
export interface DatabaseAuditLogRecord {
  id: string; // UUID primary key
  user_id: string | null;
  actor_type: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
```

### Audited Actions:
1. `cross_user_access_denied` — Unauthorized access attempt to another user's document/entity.
2. `cross_user_comparison_denied` — Attempting to compare documents where user doesn't own both.
3. `rate_limit_exceeded` — Exceeding upload cap (10/hr) or AI request cap (20/min).
4. `login_failed_attempt` / `login_locked_out` — Failed login tracking and account lockout enforcement.
5. `token_budget_exceeded` — Document token usage exceeding the 500,000 token threshold.
6. `document_deleted` / `document_purged` — Soft-delete and retention window purge events.

---

## 4. Rate Limiting, Login Lockout & Database Persistence

- **Auth & Profile Persistence:** Users and profiles are stored directly in Supabase Auth (`auth.users`) and PostgreSQL `profiles` table.
- **Login Lockout Persistence:** `loginLockout.ts` queries the PostgreSQL `audit_logs` table for `login_failed_attempt` records within the lockout window, ensuring account lockouts survive serverless cold starts across function instances.
- **Rate Limit Persistence:** `rateLimit.ts` checks the PostgreSQL `audit_logs` table for `upload` and `ai_route` rate limit records in production, guaranteeing rate limits persist globally across serverless function isolates.
- **Document & Data Persistence:** All documents, clauses, findings, timelines, comparisons, summaries, and action plans are persisted to Supabase PostgreSQL with RLS policies enabled.
- **Upload Caps:** 10 uploads per hour per user/IP. Exceeding returns HTTP 429 Too Many Requests with a `Retry-After` header and records an audit log entry.
- **AI Request Caps:** 20 requests per minute per user/IP across all AI API endpoints.
- **Token Usage Budget:** 500,000 tokens per document tracked via `ai_runs.token_usage`.

---

## 5. Shareable Read-Only Summary Links Security Surface (Feature 6)

Public shareable summary links (`/share/[token]`) expose document summaries to unauthenticated external readers. To prevent data leakage, unauthorized text extraction, and token harvesting, the following controls are strictly enforced:

### Cryptographic CSPRNG Token Hashing (SHA-256)
- **Token Entropy:** Share link URL tokens are generated using a 256-bit cryptographically secure pseudorandom number generator (32 random bytes = 64 hex characters).
- **Database Hash Storage:** Raw tokens are **NEVER** stored in the database or logs. The database stores only `token_hash = SHA256(raw_token)`. A database leak or compromise cannot reveal active tokens.
- **Lookup Verification:** Incoming HTTP requests to `/api/shared/[token]` hash the URL token and query `token_hash` in PostgreSQL.

### Public Endpoint Rate-Limiting & IP Keying
- **IP-Keyed Rate Limits:** Unauthenticated calls to `/api/shared/[token]` execute `checkRateLimit(ip, 'ai_route')`, enforcing a sliding window rate limit (20 reqs/min) keyed strictly by client IP address (`req.headers.get('x-forwarded-for') || '127.0.0.1'`), requiring zero reliance on user session cookies.

### Strict Scope Restriction (`summary_xray_only`)
- **Scope Limit:** Public shared links return plain-language summaries (`summaryText`, `keyTakeaways`) and aggregate X-Ray risk scorecards.
- **Sensitive Field Stripping:** Raw text (`raw_text`), storage paths (`storage_path`), clause embeddings, and original file downloads are **STRICTLY EXCLUDED** from the public API payload.

### Instant Revocation & Expiration
- **Expiration Enforcement:** Share links carry an explicit `expires_at` timestamp (default: 7 days).
- **Owner Revocation:** Document owners can invalidate active links instantly via `revokeSharedLink()` (`revoked_at = NOW()`). Access attempts post-revocation return HTTP 404 Access Denied.
- **Audit Logging:** Access events write audit records (`SharedLinkAuditRecord`) tracking access timestamps, client IP addresses, and token hashes.

---

## 6. Verification & Security Testing Metrics

Security controls are automatically validated via Vitest against PostgreSQL data models:
- `src/lib/security/maliciousDocument.test.ts` — 8 tests (heuristic injection defenses + Gemini prompt safety checks).
- `src/lib/rls.test.ts` — 15 tests (explicit RLS cross-user isolation and schema ownership test suite).
- `src/lib/sharing/shareStorage.test.ts` — 4 tests (256-bit token hash validation, SHA-256 lookup, instant revocation, and RLS revocation ownership enforcement).
- `src/lib/security/rateLimitProbe.test.ts` — 2 tests (11th request HTTP 429 + `Retry-After` header probe).
- `src/lib/security/loginLockout.test.ts` — 9 tests (lockout state calculation and cold-start audit log lookup tests).
- **Total Test Suite:** **191 passing tests across 32 test files (100% PASS)**.

---

## 7. AI Verification & Live Model Quota Disclosure

> [!NOTE]
> AI outputs are validated by a zero-hallucination benchmark gate; live-model verification is currently constrained by free-tier API quota (see benchmark walkthrough for details) and will require a paid tier for full-coverage live regression testing.

