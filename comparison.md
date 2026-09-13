# Skill: Contract Comparison

Source: Section 1.5.G, Section 3.4, Section 9.1 (`comparisons`,
`comparison_findings`) of `docs/LegalLens_Master_Spec.md`. Load this
skill for: multi-document comparison, semantic clause matching,
difference detection.

## Comparison flow

```
Select Document A + Select Document B → Build Comparable Structures →
Semantic Clause Matching → Difference Analysis → Comparison Dashboard
→ Questions & Action Items
```

## Compare by these categories

Payment terms · termination · liability · confidentiality ·
intellectual property · renewal · obligations · rights · dispute
resolution · other detected clauses.

## Output

Similarities · differences · missing sections · potentially
higher-impact differences · questions to consider.

## Schema — severity/kind split (Decision 11, same rule as X-Ray)

`comparison_findings.severity_level` and `comparison_findings.
finding_kind` are separate fields — do not collapse back into a single
`importance_level`.

## Access control — this is the one place ownership is easy to get wrong

Creating or reading a `comparisons` row requires
`document_a.user_id == document_b.user_id == authenticated_user.id`
for **both** documents. Check this at the API layer AND enforce it
again with RLS. A user must own both documents in a comparison, not
just the comparison row itself — this is a common place for a
cross-user data leak to slip through if only the comparison row's own
`user_id` is checked.

## Test gate for this area (Sprint 8)

- Side-by-side correctness
- Missing clauses correctly identified (not silently dropped)
- Similar clause wording is matched, not treated as "different" just
  because phrasing differs
- Every `comparison_finding` cites a valid `source_reference` in
  **both** documents — no invented differences (zero-hallucination
  gate)
