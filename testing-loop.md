# Skill: Testing Loop, Sprint Checklists & Zero-Hallucination Gate

Source: Section 10 (Implementation Plan) of
`docs/LegalLens_Master_Spec.md`. Load this skill before starting any
sprint/task, and re-read it whenever you're deciding if a task is
"done."

## The Loop (mandatory for every task, no exceptions)

```
Build
  ↓
Test / Audit (this task's checklist below)
  ↓
Any failure? → Fix → back to Test/Audit (re-run the FULL checklist,
                      not just the item that failed)
  ↓ No
Regression Pass — re-run every prior sprint's Test/Audit checklist
that touches shared code or AI output, plus the AI benchmark set if
this task touches AI logic
  ↓
Any regression failure? → Fix → back to Test/Audit
  ↓ No
Task Done — next task may start
```

A task is not done because its own checklist passed once. It's done
when its checklist passes AND nothing it touched broke a
previously-passing test elsewhere.

## Zero-hallucination gate (applies to Sprints 4-9, 12 — any AI output)

Any finding, citation, date, clause explanation, or comparison result
shown to a user must carry a valid `source_reference` traceable to the
source document. A single fabricated citation found in a sampled
review fails that task's test — it is not a minor issue to note and
move past.

## Sprint checklists (condensed — see full spec for build-item detail)

**Sprint 1 — Foundation:** app builds; auth works; protected routes
work.

**Sprint 2 — Upload:** valid files upload; invalid files rejected;
users cannot access other users' files; error states work.

**Sprint 3 — Extraction:** handles varied document structures, empty
files, corrupt files, large files.

**Sprint 4 — Intelligence:** clauses map to evidence; chunk references
valid; no fabricated pages/sections; lightweight benchmark set (2-3
sample docs, seeded here, expanded in Sprint 12) passes.

**Sprint 5 — Legal X-Ray:** every finding has evidence; facts vs. AI
interpretation visually separated; no finding without a valid
`source_reference` (zero-hallucination gate).

**Sprint 6 — Simplification & Q&A:** answer citations present;
ambiguous questions handled; hallucination resistance; unsupported-
answer fallback works.

**Sprint 7 — Timeline & Action Plan:** dates map to evidence; action
items traceable to findings; no timeline/action item without a valid
`source_reference`.

**Sprint 8 — Comparison:** side-by-side correctness; missing clauses
caught; similar wording matched correctly; every comparison finding
cites valid references in both documents.

**Sprint 9 — Personal Impact & Journey:** no unsupported personalized
advice; safety language clear; every personal-impact statement traces
to an already-validated finding.

**Sprint 10 — Security:** cross-user access blocked and logged;
malicious document instructions don't alter behavior; invalid uploads
rejected.

**Sprint 11 — Accessibility:** every button/modal/form/nav/redirect/
loading-empty-error state passes a WCAG 2.2 AA check.

**Sprint 12 — AI Evaluation (full suite, expands Sprint 4's set):**
benchmark documents produce expected extraction and findings within
tolerance; zero occurrences of any defined "unacceptable
hallucination" (single occurrence fails the build); full suite re-run
on every merge touching AI logic, not just on a schedule.

## Sprint 0 note

Sprint 0 (Product Context) has no code, so its "Test/Audit" gate is an
explicit sign-off: scope clear, non-goals documented, AI boundaries
defined, reviewed by both a product and a safety reviewer before
Sprint 1 begins. Same "does not proceed until it passes" rule applies.

## Review step (apply to every task before calling it done)

Check your own change as: product engineer, security engineer, AI
engineer (confirm no fabricated evidence shipped), QA engineer,
accessibility reviewer. Don't skip any of these five lenses.
