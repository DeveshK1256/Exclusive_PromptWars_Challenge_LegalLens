import { describe, it, expect } from 'vitest';
import { computeDocumentDiff } from './documentDiff';

describe('Feature 4 — Document Version Diff & Redline View Engine', () => {
  const textV1 = `RESIDENTIAL APARTMENT LEASE AGREEMENT
1. PARTIES: Landlord John Smith leases to Tenant Jane Doe.
2. RENT: Monthly rent is $2,500 due on the 1st.
3. TERMINATION: 30 days notice required.`;

  const textV2 = `RESIDENTIAL APARTMENT LEASE AGREEMENT
1. PARTIES: Landlord John Smith leases to Tenant Jane Doe.
2. RENT: Monthly rent is $2,700 due on the 1st.
3. TERMINATION: 60 days notice required.
4. PETS: No pets allowed without consent.`;

  it('1. Computes line-by-line additions and deletions deterministically', () => {
    const diff = computeDocumentDiff(textV1, textV2, 1, 2);

    expect(diff.versionOldNumber).toBe(1);
    expect(diff.versionNewNumber).toBe(2);
    expect(diff.addedLinesCount).toBe(3); // rent changed, termination changed, pets added
    expect(diff.deletedLinesCount).toBe(2); // old rent & old termination removed

    const addedHunks = diff.hunks.filter((h) => h.type === 'added');
    expect(addedHunks.some((h) => h.text.includes('Monthly rent is $2,700'))).toBe(true);
    expect(addedHunks.some((h) => h.text.includes('PETS: No pets allowed'))).toBe(true);

    const deletedHunks = diff.hunks.filter((h) => h.type === 'deleted');
    expect(deletedHunks.some((h) => h.text.includes('Monthly rent is $2,500'))).toBe(true);
  });

  it('2. Zero Hallucination — Summary is strictly sourced from diff hunks with source_reference pointers', () => {
    const diff = computeDocumentDiff(textV1, textV2, 1, 2);

    expect(diff.summary.isAiGenerated).toBe(false);
    expect(diff.summary.modeLabel).toBe('[OFFLINE Summary]');
    expect(diff.summary.text).toContain('Version 1 to Version 2 comparison');
    expect(diff.summary.sourceReferences.length).toBeGreaterThan(0);
    expect(diff.summary.sourceReferences[0]).toContain('Added Hunks');
  });

  it('3. Explicit Sprint 8 Standard — Tests [LIVE AI Summary] mode label when live AI flag is enabled', () => {
    const liveDiff = computeDocumentDiff(textV1, textV2, 1, 2, true);

    expect(liveDiff.summary.isAiGenerated).toBe(true);
    expect(liveDiff.summary.modeLabel).toBe('[LIVE AI Summary]');
    expect(liveDiff.summary.sourceReferences.length).toBeGreaterThan(0);
  });

  it('4. Handles identical document versions with zero changes', () => {
    const diff = computeDocumentDiff(textV1, textV1, 1, 1);
    expect(diff.addedLinesCount).toBe(0);
    expect(diff.deletedLinesCount).toBe(0);
    expect(diff.summary.text).toContain('No textual changes detected');
  });
});
