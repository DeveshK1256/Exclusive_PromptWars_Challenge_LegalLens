import { describe, it, expect } from 'vitest';
import {
  runActionPlanAgent,
  synthesizeBeforeYouSignChecklist,
  synthesizeLawyerQuestions,
  synthesizeActionTasks,
} from './action/actionPlanAgent';
import { XRayFindingCard } from './xray/types';

describe('Sprint 7 — Stage 2: Action Plan & Lawyer Questions Test Suite', () => {
  const docId = 'doc_action_test_101';
  const verId = 'ver_action_v1';

  const mockFindings: XRayFindingCard[] = [
    {
      id: 'f_red_1',
      document_id: docId,
      document_version_id: verId,
      clause_id: 'c1',
      category: 'Liability & Risk Allocation',
      severity: 'red',
      finding_kind: 'action_required',
      title: 'Unlimited Indemnification Exposure',
      description: 'Employee assumes unlimited third-party financial liability.',
      finding_type: 'recommendation',
      confidence: 0.95,
      source_reference: 'Page 3, Section 7',
      created_at: new Date().toISOString(),
    },
    {
      id: 'f_orange_2',
      document_id: docId,
      document_version_id: verId,
      clause_id: 'c2',
      category: 'Termination & Cancellation',
      severity: 'orange',
      finding_kind: 'deadline',
      title: 'Short 7-Day Departure Notice Required',
      description: 'Must notify within 7 days or forfeit accrued benefits.',
      finding_type: 'ai_interpretation',
      confidence: 0.92,
      source_reference: 'Page 2, Section 4',
      created_at: new Date().toISOString(),
    },
    {
      id: 'f_yellow_3',
      document_id: docId,
      document_version_id: verId,
      clause_id: 'c3',
      category: 'Governing Law',
      severity: 'yellow',
      finding_kind: 'informational',
      title: 'Out-of-State Jurisdiction Specified',
      description: 'Delaware state laws govern dispute resolution.',
      finding_type: 'fact',
      confidence: 0.98,
      source_reference: 'Page 4, Section 10',
      created_at: new Date().toISOString(),
    },
  ];

  it('synthesizes Before You Sign checklist including red, orange, AND yellow findings', () => {
    const checklist = synthesizeBeforeYouSignChecklist(mockFindings);

    expect(checklist.length).toBe(3);
    const severities = checklist.map((c) => c.severity);
    expect(severities).toContain('red');
    expect(severities).toContain('orange');
    expect(severities).toContain('yellow');
  });

  it('generates Questions for a Legal Professional with 100% traceabilty to findings', () => {
    const questions = synthesizeLawyerQuestions(docId, mockFindings);

    expect(questions.length).toBeGreaterThan(0);
    questions.forEach((q) => {
      expect(q.related_finding_id).toBeDefined();
      expect(q.source_reference).toBeDefined();
      expect(q.question).toContain('How does the');
    });
  });

  it('generates Action Plan tasks matching DB ActionItem schema fidelity (1:1 type contract)', async () => {
    const result = await runActionPlanAgent({
      documentId: docId,
      documentVersionId: verId,
      rawText: 'Sample contract raw text for action plan generation',
      findings: mockFindings,
    });

    expect(result.actionItems.length).toBeGreaterThan(0);
    result.actionItems.forEach((task) => {
      expect(task.id).toBeDefined();
      expect(task.action_plan_id).toBeDefined();
      expect(task.title).toBeDefined();
      expect(task.priority).toBeDefined();
      expect(task.status).toBe('pending');
      expect(task.source_reference).toBeDefined();
    });
  });
});
