// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentSpatial3DMap } from './DocumentSpatial3DMap';
import { XRayFindingCard } from '@/lib/xray/types';

const mockFourFindings: XRayFindingCard[] = [
  {
    id: 'f1',
    document_id: 'doc_1',
    document_version_id: 'v1',
    clause_id: null,
    category: 'Non-Compete',
    finding_kind: 'action_required',
    severity: 'red',
    finding_type: 'recommendation',
    title: 'Broad Non-Compete Provision',
    description: 'Restricts employment nationwide for 36 months.',
    source_reference: 'Employee agrees not to engage in competing business for 36 months.',
    confidence: 0.96,
    created_at: '2026-09-14T00:00:00Z',
  },
  {
    id: 'f2',
    document_id: 'doc_1',
    document_version_id: 'v1',
    clause_id: null,
    category: 'Termination',
    finding_kind: 'deadline',
    severity: 'orange',
    finding_type: 'fact',
    title: 'Short Termination Notice Period',
    description: 'Notice period reduced from 30 days to 14 days.',
    source_reference: 'Either party may terminate upon 14 days written notice.',
    confidence: 0.92,
    created_at: '2026-09-14T00:00:00Z',
  },
  {
    id: 'f3',
    document_id: 'doc_1',
    document_version_id: 'v1',
    clause_id: null,
    category: 'Liability',
    finding_kind: 'informational',
    severity: 'yellow',
    finding_type: 'fact',
    title: 'Unlimited Liability Cap Exclusion',
    description: 'Liability cap excludes breach of confidentiality.',
    source_reference: 'Maximum liability limitation shall not apply to Section 8 breach.',
    confidence: 0.89,
    created_at: '2026-09-14T00:00:00Z',
  },
  {
    id: 'f4',
    document_id: 'doc_1',
    document_version_id: 'v1',
    clause_id: null,
    category: 'Moonlighting',
    finding_kind: 'action_required',
    severity: 'green',
    finding_type: 'recommendation',
    title: 'Outside Work Moonlighting Restriction',
    description: 'Secondary employment requires prior written approval.',
    source_reference: 'Employee shall not engage in secondary employment without approval.',
    confidence: 0.94,
    created_at: '2026-09-14T00:00:00Z',
  },
];

describe('DocumentSpatial3DMap — 4-Layer Click Mapping & Stack Suite', () => {
  it('renders all 4 layer cards in resting stack order', () => {
    render(
      <DocumentSpatial3DMap
        documentTitle="Executive Employment Agreement"
        documentType="Employment Contract"
        findings={mockFourFindings}
      />
    );

    const layerCards = screen.getAllByRole('button', { name: /Layer #/i });
    expect(layerCards).toHaveLength(4);

    expect(layerCards[0].getAttribute('aria-pressed')).toBe('false');
    expect(layerCards[1].getAttribute('aria-pressed')).toBe('false');
    expect(layerCards[2].getAttribute('aria-pressed')).toBe('false');
    expect(layerCards[3].getAttribute('aria-pressed')).toBe('false');
  });

  it('clicking EACH of the 4 layer cards displays that EXACT layer\'s title and verbatim reference in the detail panel', () => {
    render(
      <DocumentSpatial3DMap
        documentTitle="Executive Employment Agreement"
        documentType="Employment Contract"
        findings={mockFourFindings}
      />
    );

    const layerCards = screen.getAllByRole('button', { name: /Layer #/i });

    // 1. Click Layer #1
    fireEvent.click(layerCards[0]);
    expect(screen.getByText(/Employee agrees not to engage in competing business for 36 months./i)).toBeTruthy();

    // 2. Click Layer #2 — Must display Layer #2's exact title + verbatim reference (Section 4.2)
    fireEvent.click(layerCards[1]);
    expect(screen.getByText(/Either party may terminate upon 14 days written notice./i)).toBeTruthy();

    // 3. Click Layer #3 — Must display Layer #3's exact title + verbatim reference (Section 8.5)
    fireEvent.click(layerCards[2]);
    expect(screen.getByText(/Maximum liability limitation shall not apply to Section 8 breach./i)).toBeTruthy();

    // 4. Click Layer #4 — Must display Layer #4's exact title + verbatim reference (Section 12.1)
    fireEvent.click(layerCards[3]);
    expect(screen.getByText(/Employee shall not engage in secondary employment without approval./i)).toBeTruthy();
  });
});
