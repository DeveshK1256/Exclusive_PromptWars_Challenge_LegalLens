# Skill: Legal X-Ray, Personal Impact & Safety Language

Source: Section 1.5.C/D/E, Section 3.2/3.3/3.6/3.9, Decision 6/7/10/11
of `docs/LegalLens_Master_Spec.md`. Load this skill for: Legal X-Ray
classification, simplification, personal-impact ("what does this mean
for me"), and all user-facing safety/caution language.

## Legal X-Ray: two SEPARATE dimensions (Decision 11)

Do **not** combine these into one enum. A clause can be high-severity
AND a deadline at the same time.

- `severity_level`: 🟢 general/standard · 🟡 important to understand ·
  🟠 potential attention area · 🔴 high-impact attention area
- `finding_kind`: `informational` · `action_required` · `deadline`

## Safety language rules (Decision 6 — always apply)

Never state a clause is: illegal · invalid · enforceable ·
unenforceable — **unless** reliable jurisdiction-aware evidence
supports it (see jurisdiction handling below). Default phrasing:

- "Potential attention area"
- "May have significant impact"
- "Consider reviewing"
- "Question to clarify"

## Jurisdiction handling (Decision 10 — resolved, don't re-litigate)

`documents.jurisdiction` is optional and user-supplied. It is **never**
inferred from document content. When absent, or when no reliable
jurisdiction-specific source exists for the stated jurisdiction, always
fall back to jurisdiction-neutral language above. MVP defaults to
jurisdiction-neutral; jurisdiction-aware workflows are V2.0, gated on
having an actual reliable data source for that jurisdiction.

## Simplification requirements

Provide: executive summary, plain-language summary, clause-by-clause
explanation, key terms glossary, and adjustable explanation levels
(Very simple / Student / Professional / Legal terminology).

Rule: preserve uncertainty — do not change legal meaning while
simplifying, and clearly flag ambiguous text as ambiguous rather than
resolving it silently.

## Personal Impact Agent contract

- Input: document findings + optional `context_role` (Employee,
  Tenant, Freelancer, Business owner, Consumer, Student, Other)
- **Naming: `context_role`, never "role"** — this is not an
  authorization/permission concept (Decision 7)
- Output: "what this may mean for you" + practical considerations
- Must avoid: personalized legal advice, guaranteed outcomes, and
  introducing any new claim not already validated as a `finding` —
  Personal Impact only reframes existing validated findings for the
  user's context, it does not generate new unverified claims

## Safety & Policy Agent (final-output reviewer)

Before any AI output reaches the user, check for: unsupported legal
conclusions, missing disclaimers, overconfident language, hallucinated
citations, high-risk legal-advice framing, urgent-escalation signals
that should prompt a "consider contacting a professional now" note.

## Required disclaimer (display clearly, every session)

> LegalLens AI provides general legal information and document
> assistance. It does not provide legal advice and does not replace a
> qualified legal professional. Laws and legal interpretations vary by
> jurisdiction and individual circumstances.

## Test gate for this area (Sprint 5, 9)

- Every displayed finding has evidence; facts and AI interpretation
  are visually/structurally separate
- No finding displayed without a valid `source_reference`
  (zero-hallucination gate)
- No unsupported personalized legal advice; safety language stays
  clear and consistent across every screen
- Every personal-impact statement traces to a finding already
  validated upstream — no new unverified claims introduced here
