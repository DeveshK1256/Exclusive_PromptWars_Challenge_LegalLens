import { GroundTruthDocument } from './fixtures';
import { XRayFindingCard } from '../../xray/types';
import { ExtractedClauseItem, ExtractedEntityItem } from '../../intelligence/types';
import { TimelineEvent } from '@/types/database';
import { ActionPlanResult } from '../../action/types';
import { ContractComparisonResult, ComparisonFinding } from '../../comparison/types';
import { PersonalImpactResult } from '../../impact/types';
import { SimplificationResult } from '../../simplification/types';
import { QAResponse } from '../../qa/types';

export interface HallucinationCheckResult {
  category: 
    | 'fabricated_citation'
    | 'invented_date'
    | 'schema_mismatch'
    | 'jurisdiction_assertion'
    | 'mismatched_comparison_ref';
  passed: boolean;
  details: string;
  sourceTextExcerpt?: string;
  agentName: string;
}

export interface AgentDiagnosticCell {
  category: string;
  total: number;
  passed: number;
  failed: number;
  status: 'PASS' | 'FAIL' | 'N/A';
}

export interface AgentDiagnosticRow {
  agentName: string;
  citationGrounding: AgentDiagnosticCell;
  dateTraceability: AgentDiagnosticCell;
  schemaSeparation: AgentDiagnosticCell;
  jurisdictionNeutrality: AgentDiagnosticCell;
  comparisonGrounding: AgentDiagnosticCell;
  overallStatus: 'PASS 🟢' | 'FAIL 🔴';
}

/**
 * 1. Verifies Citation Verbatim Substring Matching
 */
export function checkCitationVerbatimGrounding(
  agentName: string,
  sourceRef: string,
  rawText: string
): HallucinationCheckResult {
  if (!sourceRef) {
    return {
      category: 'fabricated_citation',
      passed: false,
      details: `[${agentName}] Empty source_reference field.`,
      agentName,
    };
  }

  const normalizedRaw = rawText.toLowerCase().replace(/\s+/g, ' ');

  // Extract quoted text after colon : "..." or explicit quoted snippets
  let quoteMatches: string[] = [];

  const colonQuote = sourceRef.match(/:\s*["']([^"']+)["']/);
  if (colonQuote && colonQuote[1]) {
    quoteMatches.push(colonQuote[1]);
  } else {
    // Extract quotes enclosed in quotation marks
    const matches = sourceRef.match(/["']([^"']+)["']/g) || [];
    quoteMatches = matches.map((m) => m.replace(/["']/g, ''));
  }

  if (quoteMatches.length === 0) {
    return {
      category: 'fabricated_citation',
      passed: true,
      details: `[${agentName}] Structural source reference "${sourceRef}" is valid.`,
      agentName,
    };
  }

  for (const q of quoteMatches) {
    let cleanQuote = q.trim().toLowerCase().replace(/\s+/g, ' ');
    cleanQuote = cleanQuote.replace(/\.\.\.$/, '').trim();

    if (cleanQuote.length > 5 && !normalizedRaw.includes(cleanQuote)) {
      const shortSnippet = cleanQuote.substring(0, 30);
      if (!normalizedRaw.includes(shortSnippet)) {
        return {
          category: 'fabricated_citation',
          passed: false,
          details: `[${agentName}] Fabricated citation quote "${q}" not found in source text.`,
          sourceTextExcerpt: sourceRef,
          agentName,
        };
      }
    }
  }

  return {
    category: 'fabricated_citation',
    passed: true,
    details: `[${agentName}] Source reference "${sourceRef}" is validly grounded.`,
    agentName,
  };
}

/**
 * 2. Verifies Date & Milestone Traceability
 */
export function checkDateTraceability(
  agentName: string,
  dateText: string,
  rawText: string
): HallucinationCheckResult {
  if (!dateText) {
    return {
      category: 'invented_date',
      passed: true,
      details: `[${agentName}] No date string present to check.`,
      agentName,
    };
  }

  const normalizedRaw = rawText.toLowerCase();
  const normalizedDate = dateText.toLowerCase();

  let grounded = normalizedRaw.includes(normalizedDate);

  if (!grounded) {
    const numMatches = dateText.match(/\b\d{1,4}\b/g) || [];
    if (numMatches.length > 0) {
      grounded = numMatches.some((num) => normalizedRaw.includes(num));
    } else {
      const words = normalizedDate.split(/\s+/).filter((w) => w.length > 3);
      grounded = words.some((w) => normalizedRaw.includes(w));
    }
  }

  if (!grounded) {
    return {
      category: 'invented_date',
      passed: false,
      details: `[${agentName}] Invented date/milestone "${dateText}" not traceable to source text.`,
      agentName,
    };
  }

  return {
    category: 'invented_date',
    passed: true,
    details: `[${agentName}] Date "${dateText}" successfully traced to source text.`,
    agentName,
  };
}

/**
 * 3. Verifies Schema Separation of severity_level and finding_kind
 */
export function checkSeverityKindSchemaSeparation(
  agentName: string,
  item: { severity_level?: string; severity?: string; finding_kind?: string }
): HallucinationCheckResult {
  const sev = item.severity_level || item.severity;
  const kind = item.finding_kind;

  const validSeverities = ['green', 'yellow', 'orange', 'red'];
  const validKinds = ['informational', 'action_required', 'deadline'];

  if (!sev || !validSeverities.includes(sev)) {
    return {
      category: 'schema_mismatch',
      passed: false,
      details: `[${agentName}] Invalid or combined severity_level: "${sev}". Must be green|yellow|orange|red.`,
      agentName,
    };
  }

  if (!kind || !validKinds.includes(kind)) {
    return {
      category: 'schema_mismatch',
      passed: false,
      details: `[${agentName}] Invalid or combined finding_kind: "${kind}". Must be informational|action_required|deadline.`,
      agentName,
    };
  }

  return {
    category: 'schema_mismatch',
    passed: true,
    details: `[${agentName}] Schema correctly separates severity_level ("${sev}") and finding_kind ("${kind}").`,
    agentName,
  };
}

/**
 * 4. Verifies Jurisdiction Neutrality
 */
export function checkJurisdictionNeutrality(
  agentName: string,
  text: string,
  userJurisdiction?: string
): HallucinationCheckResult {
  if (userJurisdiction) {
    return {
      category: 'jurisdiction_assertion',
      passed: true,
      details: `[${agentName}] Explicit user jurisdiction supplied ("${userJurisdiction}"); neutrality assertion bypassed.`,
      agentName,
    };
  }

  const forbiddenPatterns = [
    /\b(?:is illegal|are illegal)\b/i,
    /\b(?:is invalid|are invalid)\b/i,
    /\b(?:is unenforceable|are unenforceable)\b/i,
    /\bguarantee court outcome\b/i,
    /\bguarantees victory\b/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) {
      return {
        category: 'jurisdiction_assertion',
        passed: false,
        details: `[${agentName}] Inferred jurisdiction violation! Text asserts absolute legal validity/illegality without user jurisdiction: "${text}"`,
        agentName,
      };
    }
  }

  return {
    category: 'jurisdiction_assertion',
    passed: true,
    details: `[${agentName}] Output maintains strict jurisdiction-neutral caution phrasing.`,
    agentName,
  };
}

/**
 * 5. Verifies Comparison Cross-Document Grounding
 */
export function checkComparisonCrossDocGrounding(
  agentName: string,
  compResult: ContractComparisonResult,
  rawTextA: string,
  rawTextB: string
): HallucinationCheckResult {
  for (const finding of compResult.findings) {
    if (finding.source_reference_a && finding.source_reference_a !== 'Absent in Document A') {
      const citeCheckA = checkCitationVerbatimGrounding(agentName, finding.source_reference_a, rawTextA);
      if (!citeCheckA.passed) {
        return {
          category: 'mismatched_comparison_ref',
          passed: false,
          details: `[${agentName}] Comparison source_reference_a "${finding.source_reference_a}" not grounded in Document A.`,
          agentName,
        };
      }
    }
    if (finding.source_reference_b && finding.source_reference_b !== 'Absent in Document B') {
      const citeCheckB = checkCitationVerbatimGrounding(agentName, finding.source_reference_b, rawTextB);
      if (!citeCheckB.passed) {
        return {
          category: 'mismatched_comparison_ref',
          passed: false,
          details: `[${agentName}] Comparison source_reference_b "${finding.source_reference_b}" not grounded in Document B.`,
          agentName,
        };
      }
    }
  }

  return {
    category: 'mismatched_comparison_ref',
    passed: true,
    details: `[${agentName}] Contract comparison cross-document references are fully grounded in both source documents.`,
    agentName,
  };
}

/**
 * Diagnostic Report Matrix Generator (Requirement 2)
 * Formats side-by-side diagnostic log table for all 8 agents x 5 categories.
 */
export function printBenchmarkDiagnosticMatrix(rows: AgentDiagnosticRow[]): string {
  const pad = (str: string, len: number) => str.padEnd(len, ' ');
  const fmtCell = (cell: AgentDiagnosticCell) => {
    if (cell.status === 'N/A') return 'N/A       ';
    return `${cell.status} (${cell.passed}/${cell.total})`.padEnd(10, ' ');
  };

  let report = '\n' + '='.repeat(105) + '\n';
  report += '                          LEGALLENS AI ZERO-HALLUCINATION BENCHMARK DIAGNOSTIC MATRIX\n';
  report += '='.repeat(105) + '\n';
  report += `${pad('Agent Name', 22)}│ ${pad('Citation Grounding', 18)}│ ${pad('Date Traceability', 18)}│ ${pad('Schema Separation', 18)}│ ${pad('Jurisdiction Neutral', 20)}│ ${pad('Comparison Ground', 18)}│ ${pad('Status', 8)}\n`;
  report += '-'.repeat(22) + '┼' + '-'.repeat(19) + '┼' + '-'.repeat(19) + '┼' + '-'.repeat(19) + '┼' + '-'.repeat(21) + '┼' + '-'.repeat(19) + '┼' + '-'.repeat(8) + '\n';

  let totalChecks = 0;
  let totalFailures = 0;

  for (const row of rows) {
    const cells = [row.citationGrounding, row.dateTraceability, row.schemaSeparation, row.jurisdictionNeutrality, row.comparisonGrounding];
    cells.forEach((c) => {
      totalChecks += c.total;
      totalFailures += c.failed;
    });

    report += `${pad(row.agentName, 22)}│ ${pad(fmtCell(row.citationGrounding), 18)}│ ${pad(fmtCell(row.dateTraceability), 18)}│ ${pad(fmtCell(row.schemaSeparation), 18)}│ ${pad(fmtCell(row.jurisdictionNeutrality), 20)}│ ${pad(fmtCell(row.comparisonGrounding), 18)}│ ${row.overallStatus}\n`;
  }

  report += '='.repeat(105) + '\n';
  report += `TOTAL UNACCEPTABLE HALLUCINATIONS DETECTED: ${totalFailures} / ${totalChecks} checks\n`;
  report += `BENCHMARK REGRESSION GATE RESULT: ${totalFailures === 0 ? 'PASSED 🟢 (0 Hallucination Violations)' : 'FAILED 🔴 (' + totalFailures + ' Violations)'}\n`;
  report += '='.repeat(105) + '\n';

  return report;
}
