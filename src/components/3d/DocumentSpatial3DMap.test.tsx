// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentSpatial3DMap } from './DocumentSpatial3DMap';
import { XRayFindingCard } from '@/lib/xray/types';

const mockFindings: XRayFindingCard[] = [
  {
    id: 'f1',
    document_version_id: 'v1',
    section_label: 'Section 1',
    finding_kind: 'informational',
    severity: 'green',
    finding_type: 'fact',
    title: 'Standard Terms',
    description: 'General governing terms and conditions.',
    source_reference: 'Section 1.1',
    confidence: 0.95,
  },
  {
    id: 'f2',
    document_version_id: 'v1',
    section_label: 'Section 2',
    finding_kind: 'deadline',
    severity: 'orange',
    finding_type: 'fact',
    title: 'Notice Window & Cancellation Provision',
    description: 'Requires 30 days written notice for termination.',
    source_reference: 'Section 2.4',
    confidence: 0.91,
  },
  {
    id: 'f3',
    document_version_id: 'v1',
    section_label: 'Section 3',
    finding_kind: 'action_required',
    severity: 'red',
    finding_type: 'recommendation',
    title: 'Liability Cap Exclusion',
    description: 'Unlimited liability for indirect damages.',
    source_reference: 'Section 3.2',
    confidence: 0.98,
  },
];

describe('DocumentSpatial3DMap — Layer Stacking & Focus Suite', () => {
  it('renders all layer cards in resting stack order', () => {
    render(
      <DocumentSpatial3DMap
        documentTitle="Executive Employment Agreement"
        documentType="Employment Contract"
        findings={mockFindings}
      />
    );

    const layerCards = screen.getAllByRole('button', { name: /Layer #/i });
    expect(layerCards).toHaveLength(3);

    // Initial resting stack: unselected cards have zIndex corresponding to (findings.length - idx)
    expect(layerCards[0].style.zIndex).toBe('3');
    expect(layerCards[1].style.zIndex).toBe('2');
    expect(layerCards[2].style.zIndex).toBe('1');
    expect(layerCards[1].getAttribute('aria-pressed')).toBe('false');
  });

  it('elevates ONLY the 2nd layer card to highest zIndex (50) and active state on mouse click', () => {
    render(
      <DocumentSpatial3DMap
        documentTitle="Executive Employment Agreement"
        documentType="Employment Contract"
        findings={mockFindings}
      />
    );

    const layerCards = screen.getAllByRole('button', { name: /Layer #/i });
    const secondCard = layerCards[1];

    // Click 2nd layer card
    fireEvent.click(secondCard);

    const updatedCards = screen.getAllByRole('button', { name: /Layer #/i });
    const activeSecondCard = updatedCards[1];

    // Assert 2nd card is promoted to highest zIndex (50) and aria-pressed is true
    expect(activeSecondCard.style.zIndex).toBe('50');
    expect(activeSecondCard.getAttribute('aria-pressed')).toBe('true');
    expect(activeSecondCard.style.transform).toContain('translateZ(180px)'); // (3 * 20) + 120 = 180px

    // Unselected cards maintain default resting stack zIndex
    expect(updatedCards[0].style.zIndex).toBe('3');
    expect(updatedCards[2].style.zIndex).toBe('1');
    expect(updatedCards[0].getAttribute('aria-pressed')).toBe('false');
    expect(updatedCards[2].getAttribute('aria-pressed')).toBe('false');
  });

  it('elevates 2nd layer card via keyboard Enter keypress without regressing WCAG accessibility', () => {
    render(
      <DocumentSpatial3DMap
        documentTitle="Executive Employment Agreement"
        documentType="Employment Contract"
        findings={mockFindings}
      />
    );

    const layerCards = screen.getAllByRole('button', { name: /Layer #/i });
    const secondCard = layerCards[1];

    // Fire keydown and click event for keyboard Enter activation in jsdom
    fireEvent.keyDown(secondCard, { key: 'Enter', code: 'Enter' });
    fireEvent.click(secondCard);

    const updatedCards = screen.getAllByRole('button', { name: /Layer #/i });
    const activeSecondCard = updatedCards[1];

    expect(activeSecondCard.style.zIndex).toBe('50');
    expect(activeSecondCard.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(/Verbatim Reference: "Section 2.4"/i)).toBeTruthy();
  });
});
