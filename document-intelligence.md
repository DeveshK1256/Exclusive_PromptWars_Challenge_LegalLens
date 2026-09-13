# Skill: Document Intelligence

Source: Section 1.5.B, Section 2.3, Section 3.1, Section 9.1 of
`docs/LegalLens_Master_Spec.md`. Load this skill for: upload handling,
text extraction, chunking, entity/clause extraction, embeddings.

## Pipeline (must run in this order)

```
Upload → Validate File → Store Securely → Extract Text → OCR if
Required → Detect Document Type → Create Document Structure → Chunk
by Semantic Section → Generate Embeddings → Extract Deterministic
Facts → AI Analysis → Legal X-Ray → Evidence Validation
```

## What to extract

Document type · parties · important dates · deadlines · clauses ·
obligations · rights · responsibilities · financial terms ·
termination conditions · governing/dispute info where present.

`document_type` is a **controlled vocabulary**, not free text:
`employment_contract`, `nda`, `rental_agreement`, `service_agreement`,
`loan_document`, `policy_document`, `terms_of_service`, `other`
(fallback — still fully processed).

## Document Intelligence Agent contract

- Input: extracted document text + metadata
- Output: document type, sections, clauses, parties, dates, key
  entities
- Every entity/clause must carry a `source_reference` and a
  `confidence` float (0.0–1.0)

## Versioning rule (Decision 13 — do not skip)

`document_sections`, `document_chunks`, `document_entities`, `clauses`,
`findings`, and `timelines` are all scoped to a `document_version_id`,
not just `document_id`. Re-analysis (re-upload, reprocessing) creates a
**new version** — it never mutates or deletes a prior version's rows.
Only the latest version's data is shown to the user by default; prior
versions remain queryable for audit purposes.

## Limits (MVP, config-driven — do not hardcode without a config knob)

- Max file size: 25 MB
- Max length: ~200 pages / ~150k tokens; longer documents are chunked
  and processed in batches, with the user informed of partial-analysis
  limits
- Per-document AI token budget tracked via `ai_runs.token_usage`, with
  an alert threshold (default 500k tokens/document)

## Duplicate detection

Store `file_hash` (sha256) per document to detect a user re-uploading
the same file. Not a global uniqueness constraint — two different
users may legitimately upload the same template.

## Test gate for this area (Sprint 3-4)

- Handles different document structures, empty files, corrupt files,
  large files without crashing
- Important clauses map to evidence; chunk references are valid
- No fabricated pages/sections
- Lightweight benchmark set (2-3 sample docs with known-expected
  extraction) passes — this benchmark set is the seed for the full
  regression suite in `skills/testing-loop.md`
