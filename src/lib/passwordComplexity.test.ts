import { describe, it, expect } from 'vitest';
import { validatePasswordComplexity } from './auth';

describe('Password Complexity Enforcement Unit Test Suite (Bug B)', () => {
  it('rejects password that is under 8 characters long', () => {
    const res = validatePasswordComplexity('Short1!');
    expect(res.valid).toBe(false);
    expect(res.rules.minLength).toBe(false);
    expect(res.errors.some(e => e.includes('8 characters'))).toBe(true);
  });

  it('rejects password missing an uppercase letter', () => {
    const res = validatePasswordComplexity('lowercase123!');
    expect(res.valid).toBe(false);
    expect(res.rules.hasUppercase).toBe(false);
    expect(res.errors.some(e => e.includes('uppercase'))).toBe(true);
  });

  it('rejects password missing a lowercase letter', () => {
    const res = validatePasswordComplexity('UPPERCASE123!');
    expect(res.valid).toBe(false);
    expect(res.rules.hasLowercase).toBe(false);
    expect(res.errors.some(e => e.includes('lowercase'))).toBe(true);
  });

  it('rejects password missing a numeric digit', () => {
    const res = validatePasswordComplexity('NoNumbersHere!');
    expect(res.valid).toBe(false);
    expect(res.rules.hasNumber).toBe(false);
    expect(res.errors.some(e => e.includes('numeric digit'))).toBe(true);
  });

  it('rejects password missing a special character', () => {
    const res = validatePasswordComplexity('NoSpecialChar123');
    expect(res.valid).toBe(false);
    expect(res.rules.hasSpecialChar).toBe(false);
    expect(res.errors.some(e => e.includes('special character'))).toBe(true);
  });

  it('accepts a fully compliant password meeting all 5 rules', () => {
    const res = validatePasswordComplexity('ValidPass123!');
    expect(res.valid).toBe(true);
    expect(res.rules.minLength).toBe(true);
    expect(res.rules.hasUppercase).toBe(true);
    expect(res.rules.hasLowercase).toBe(true);
    expect(res.rules.hasNumber).toBe(true);
    expect(res.rules.hasSpecialChar).toBe(true);
    expect(res.errors).toHaveLength(0);
  });
});