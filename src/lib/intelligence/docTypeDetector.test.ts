import { describe, it, expect } from 'vitest';
import { detectDocumentType } from './docTypeDetector';

describe('Document Type Auto-Detector', () => {
  it('detects Rental Lease agreement keywords', () => {
    const text = 'RESIDENTIAL APARTMENT LEASE AGREEMENT Landlord leases to Tenant Premises at Monthly rent $2500 security deposit subletting prohibited.';
    const result = detectDocumentType(text);
    expect(result.detectedType).toBe('rental_agreement');
    expect(result.displayName).toBe('Rental & Lease Agreement');
  });

  it('detects Employment Contract keywords', () => {
    const text = 'EXECUTIVE EMPLOYMENT AGREEMENT Employee salary $120000 non-compete invention assignment employer';
    const result = detectDocumentType(text);
    expect(result.detectedType).toBe('employment_contract');
  });

  it('detects Terms of Service keywords', () => {
    const text = 'TERMS OF SERVICE AND USER AGREEMENT binding arbitration class action waiver';
    const result = detectDocumentType(text);
    expect(result.detectedType).toBe('terms_of_service');
  });

  it('defaults to other for generic text', () => {
    const text = 'Hello world random document notes';
    const result = detectDocumentType(text);
    expect(result.detectedType).toBe('other');
  });
});
