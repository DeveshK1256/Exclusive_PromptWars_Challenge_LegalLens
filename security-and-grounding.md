# Skill: Security, Privacy & Access Control

Source: Section 6.4, Decision 9, Section 9.3, Sprint 10 of
`docs/LegalLens_Master_Spec.md`. Load this skill for: authentication,
authorization, RLS, file validation, retention/deletion, audit logging.

## File upload protection

Protect against: unsupported files, oversized files, malicious content,
path traversal, archive bombs if archives are later supported.

## Access control (Section 9.3)

Every user-owned table enforces `document.user_id ==
authenticated_user.id` (or equivalent) via RLS. Tables referencing two
documents (`comparisons`) require BOTH documents to belong to the
requesting user — see `skills/comparison.md` for the specific check.
Every denied access attempt is written to `audit_logs`, not silently
dropped.

## Privacy by design (Decision 9)

- Strict user ownership, signed/private storage, no public document
  URLs
- Soft-delete: `documents.deleted_at` set, storage object removed
  immediately
- Hard purge after a configurable retention window
  (`retention_expires_at`, default 30 days)
- Every deletion, purge, download, and cross-user access denial is
  recorded in `audit_logs` (actor_type, action, resource_type,
  resource_id, metadata, created_at)
- Minimal logging of actual document content — log references/IDs, not
  raw text, wherever possible

## Rate limiting & cost control

- Uploads capped per user per hour; Q&A requests capped per user per
  minute (exact values set in Sprint 10 based on real usage data)
- Per-document AI token budget tracked via `ai_runs.token_usage` with
  an alert threshold (default 500k tokens/document)

## Test gate for this area (Sprint 10)

- Cross-user access attempts are blocked and logged
- Malicious document instructions do not alter agent behavior (see
  `skills/qa-and-grounding.md` for the injection-handling mechanism)
- Invalid uploads rejected cleanly with clear error messaging
- Secrets never appear in logs or prompts
