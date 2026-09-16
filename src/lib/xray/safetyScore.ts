import { SeverityLevel } from '@/types/database';

export interface FindingLike {
  severity_level?: SeverityLevel;
  severity?: SeverityLevel;
  [key: string]: any;
}

export interface SafetyScoreResult {
  score: number; // 0 - 100
  ratingLabel: string;
  badgeColor: string;
  strokeColor: string;
  summaryDesc: string;
  breakdown: {
    red: number;
    orange: number;
    yellow: number;
    green: number;
  };
  penaltyRed: number;
  penaltyOrange: number;
  penaltyYellow: number;
  totalPenalty: number;
  bonusGreen: number;
}

/**
 * Deterministic Safety Score Formula Engine (Section 2 - Feature Epic)
 * Computes a 1–100 reproducible score derived strictly from finding severity counts.
 * NO LLM call is used.
 *
 * Formula:
 * - Red findings: -15 points each (max penalty cap = 60)
 * - Orange findings: -8 points each (max penalty cap = 32)
 * - Yellow findings: -3 points each (max penalty cap = 15)
 * - Green findings: +1 bonus point (max bonus = 5, only if total penalty > 0, score max = 100)
 */
export function calculateSafetyScore(findings: FindingLike[] = []): SafetyScoreResult {
  const breakdown = {
    red: 0,
    orange: 0,
    yellow: 0,
    green: 0,
  };

  for (const f of findings) {
    const sev = (f.severity_level || f.severity || 'green') as SeverityLevel;
    if (sev === 'red') breakdown.red++;
    else if (sev === 'orange') breakdown.orange++;
    else if (sev === 'yellow') breakdown.yellow++;
    else breakdown.green++;
  }

  const penaltyRed = Math.min(60, breakdown.red * 15);
  const penaltyOrange = Math.min(32, breakdown.orange * 8);
  const penaltyYellow = Math.min(15, breakdown.yellow * 3);

  const totalPenalty = penaltyRed + penaltyOrange + penaltyYellow;
  const bonusGreen = totalPenalty > 0 ? Math.min(5, breakdown.green * 1) : 0;

  const rawScore = 100 - totalPenalty + bonusGreen;
  const score = Math.max(0, Math.min(100, rawScore));

  let ratingLabel = 'Standard & Fair Terms';
  let badgeColor = 'text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
  let strokeColor = '#10b981';
  let summaryDesc = 'This document contains balanced clauses matching standard industry practices.';

  if (score < 50) {
    ratingLabel = 'High Risk & Restrictive';
    badgeColor = 'text-rose-700 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
    strokeColor = '#f43f5e';
    summaryDesc = 'Caution: Contains high-severity covenants, heavy financial penalties, or unusual waivers.';
  } else if (score < 75) {
    ratingLabel = 'Attention Required';
    badgeColor = 'text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
    strokeColor = '#f59e0b';
    summaryDesc = 'Contains notice windows or fee conditions that require your attention before signing.';
  } else if (score < 90) {
    ratingLabel = 'Moderate Caution Area';
    badgeColor = 'text-yellow-700 bg-yellow-50 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20';
    strokeColor = '#eab308';
    summaryDesc = 'Generally acceptable terms with minor informational clauses to review.';
  }

  return {
    score,
    ratingLabel,
    badgeColor,
    strokeColor,
    summaryDesc,
    breakdown,
    penaltyRed,
    penaltyOrange,
    penaltyYellow,
    totalPenalty,
    bonusGreen,
  };
}
