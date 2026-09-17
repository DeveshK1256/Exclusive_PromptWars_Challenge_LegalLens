import { Document, Finding, SeverityLevel } from '@/types/database';

export type PortfolioGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface DocumentRiskSummary {
  document: Document;
  riskScore: number;
  redCount: number;
  orangeCount: number;
  yellowCount: number;
  greenCount: number;
  totalFindings: number;
}

export interface PortfolioRiskReport {
  totalDocuments: number;
  completedDocumentsCount: number;
  excludedDocumentsCount: number;
  overallPortfolioScore: number;
  portfolioGrade: PortfolioGrade;
  gradeDescription: string;
  totalRedFindings: number;
  totalOrangeFindings: number;
  totalYellowFindings: number;
  totalGreenFindings: number;
  documentSummaries: DocumentRiskSummary[];
}

export function calculateDocumentRiskScore(findings: Finding[]): {
  score: number;
  redCount: number;
  orangeCount: number;
  yellowCount: number;
  greenCount: number;
} {
  let redCount = 0;
  let orangeCount = 0;
  let yellowCount = 0;
  let greenCount = 0;

  for (const finding of findings) {
    if (finding.severity === 'red') redCount++;
    else if (finding.severity === 'orange') orangeCount++;
    else if (finding.severity === 'yellow') yellowCount++;
    else if (finding.severity === 'green') greenCount++;
  }

  const score = redCount * 15 + orangeCount * 7 + yellowCount * 2 + greenCount * 0;
  return { score, redCount, orangeCount, yellowCount, greenCount };
}

export function determinePortfolioGrade(score: number): {
  grade: PortfolioGrade;
  description: string;
} {
  if (score <= 10) {
    return { grade: 'A', description: 'Low Risk — Excellent portfolio health' };
  } else if (score <= 25) {
    return { grade: 'B', description: 'Moderate Risk — Minor areas for review' };
  } else if (score <= 45) {
    return { grade: 'C', description: 'Attention Needed — Moderate high-severity terms' };
  } else if (score <= 70) {
    return { grade: 'D', description: 'High Risk — Significant liabilities or restrictive terms' };
  } else {
    return { grade: 'F', description: 'Critical Action Required — Severe portfolio risk exposure' };
  }
}

export function generatePortfolioReport(
  userId: string,
  documents: Document[],
  allFindings: Finding[]
): PortfolioRiskReport {
  // Enforce RLS filtering: only operate on documents owned by requesting userId
  const userDocuments = documents.filter((doc) => doc.user_id === userId && !doc.deleted_at);

  // Filter completed documents for portfolio scoring formula
  const completedDocs = userDocuments.filter((doc) => doc.status === 'completed');
  const excludedDocs = userDocuments.filter((doc) => doc.status !== 'completed');

  let totalRiskScoreSum = 0;
  let totalRed = 0;
  let totalOrange = 0;
  let totalYellow = 0;
  let totalGreen = 0;

  const documentSummaries: DocumentRiskSummary[] = [];

  for (const doc of completedDocs) {
    const docFindings = allFindings.filter((f) => f.document_id === doc.id);
    const { score, redCount, orangeCount, yellowCount, greenCount } = calculateDocumentRiskScore(docFindings);

    totalRiskScoreSum += score;
    totalRed += redCount;
    totalOrange += orangeCount;
    totalYellow += yellowCount;
    totalGreen += greenCount;

    documentSummaries.push({
      document: doc,
      riskScore: score,
      redCount,
      orangeCount,
      yellowCount,
      greenCount,
      totalFindings: docFindings.length,
    });
  }

  const completedCount = completedDocs.length;
  // Formula: Sum(CompletedDocumentRiskScores) / Max(1, TotalCompletedDocuments)
  const overallPortfolioScore = Math.round((totalRiskScoreSum / Math.max(1, completedCount)) * 10) / 10;
  const { grade: portfolioGrade, description: gradeDescription } = determinePortfolioGrade(overallPortfolioScore);

  return {
    totalDocuments: userDocuments.length,
    completedDocumentsCount: completedCount,
    excludedDocumentsCount: excludedDocs.length,
    overallPortfolioScore,
    portfolioGrade,
    gradeDescription,
    totalRedFindings: totalRed,
    totalOrangeFindings: totalOrange,
    totalYellowFindings: totalYellow,
    totalGreenFindings: totalGreen,
    documentSummaries,
  };
}
