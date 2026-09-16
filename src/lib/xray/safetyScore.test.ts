import { describe, it, expect } from 'vitest';
import { calculateSafetyScore } from './safetyScore';

describe('Deterministic Safety Score Engine', () => {
  it('returns 100 for an empty findings array', () => {
    const result = calculateSafetyScore([]);
    expect(result.score).toBe(100);
    expect(result.ratingLabel).toBe('Standard & Fair Terms');
    expect(result.totalPenalty).toBe(0);
    expect(result.breakdown).toEqual({ red: 0, orange: 0, yellow: 0, green: 0 });
  });

  it('returns 100 for all-green findings', () => {
    const findings = [
      { severity_level: 'green' },
      { severity_level: 'green' },
      { severity_level: 'green' },
    ];
    const result = calculateSafetyScore(findings as any);
    expect(result.score).toBe(100);
    expect(result.totalPenalty).toBe(0);
    expect(result.bonusGreen).toBe(0); // Bonus only applies if penalty > 0
  });

  it('correctly deducts 15 points per red finding up to 60 max cap', () => {
    const oneRed = calculateSafetyScore([{ severity_level: 'red' }] as any);
    expect(oneRed.score).toBe(85);
    expect(oneRed.penaltyRed).toBe(15);

    const fiveRed = calculateSafetyScore([
      { severity_level: 'red' },
      { severity_level: 'red' },
      { severity_level: 'red' },
      { severity_level: 'red' },
      { severity_level: 'red' },
    ] as any);
    expect(fiveRed.penaltyRed).toBe(60); // Capped at 60
    expect(fiveRed.score).toBe(40);
    expect(fiveRed.ratingLabel).toBe('High Risk & Restrictive');
  });

  it('correctly calculates mixed findings with penalty and bonus caps', () => {
    const findings = [
      { severity_level: 'red' }, // -15
      { severity_level: 'orange' }, // -8
      { severity_level: 'orange' }, // -8
      { severity_level: 'yellow' }, // -3
      { severity_level: 'yellow' }, // -3
      { severity_level: 'yellow' }, // -3
      { severity_level: 'green' }, // +1
      { severity_level: 'green' }, // +1
    ];
    // Penalty: 15 + 16 + 9 = 40. Bonus: +2. Raw score = 100 - 40 + 2 = 62.
    const result = calculateSafetyScore(findings as any);
    expect(result.penaltyRed).toBe(15);
    expect(result.penaltyOrange).toBe(16);
    expect(result.penaltyYellow).toBe(9);
    expect(result.totalPenalty).toBe(40);
    expect(result.bonusGreen).toBe(2);
    expect(result.score).toBe(62);
    expect(result.ratingLabel).toBe('Attention Required');
  });

  it('clamps safety score between 0 and 100', () => {
    // Extreme high penalties (10 red, 10 orange, 10 yellow)
    const heavyFindings = Array(10).fill({ severity_level: 'red' })
      .concat(Array(10).fill({ severity_level: 'orange' }))
      .concat(Array(10).fill({ severity_level: 'yellow' }));
    
    // Caps: red=60, orange=32, yellow=15. Total penalty = 107. 100 - 107 = -7 -> clamped to 0.
    const result = calculateSafetyScore(heavyFindings as any);
    expect(result.totalPenalty).toBe(107);
    expect(result.score).toBe(0);
    expect(result.ratingLabel).toBe('High Risk & Restrictive');
  });
});
