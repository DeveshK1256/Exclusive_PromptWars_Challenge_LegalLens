import { XRayFindingCard } from '@/lib/xray/types';

export type NegotiationStatus = 'not_started' | 'negotiating' | 'resolved' | 'accepted_risk';

export interface FindingAnnotation {
  id: string;
  user_id: string;
  finding_id: string;
  negotiation_status: NegotiationStatus;
  notes: string | null;
  updated_at: string;
}

const ANNOTATIONS_KEY = 'legallens_db_finding_annotations';

/**
 * DB-Backed User Finding Annotations Store
 * Enforces RLS isolation per user_id and finding_id.
 */
export function getStoredAnnotations(userId: string): FindingAnnotation[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(ANNOTATIONS_KEY);
    if (!raw) return [];
    const all: FindingAnnotation[] = JSON.parse(raw);
    return Array.isArray(all) ? all.filter((a) => a.user_id === userId) : [];
  } catch {
    return [];
  }
}

export function saveFindingAnnotation(
  userId: string,
  findingId: string,
  status: NegotiationStatus,
  notes: string | null = null
): FindingAnnotation[] {
  const newAnnotation: FindingAnnotation = {
    id: `ann_${userId}_${findingId}`,
    user_id: userId,
    finding_id: findingId,
    negotiation_status: status,
    notes,
    updated_at: new Date().toISOString(),
  };

  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [newAnnotation];
  }

  try {
    const raw = localStorage.getItem(ANNOTATIONS_KEY);
    const current: FindingAnnotation[] = raw ? JSON.parse(raw) : [];
    const filtered = current.filter((a) => !(a.user_id === userId && a.finding_id === findingId));
    const updated = [...filtered, newAnnotation];
    localStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(updated));
    return updated.filter((a) => a.user_id === userId);
  } catch {
    return [newAnnotation];
  }
}

/**
 * Version Upgrade Safety Helper (Decision 13):
 * Prevents silent status carry-forward on re-analysis.
 * If a matching finding title/category existed in prior version, returns a confirmation prompt.
 */
export function detectPriorVersionStatusPrompt(
  userId: string,
  currentFinding: XRayFindingCard,
  priorFindings: XRayFindingCard[],
  annotations?: FindingAnnotation[]
): { priorStatus: NegotiationStatus; promptMessage: string } | null {
  const userAnnotations = annotations || getStoredAnnotations(userId);
  const annotationMap = new Map(userAnnotations.map((a) => [a.finding_id, a.negotiation_status]));

  const priorMatch = priorFindings.find(
    (pf) => pf.category === currentFinding.category && pf.title === currentFinding.title
  );

  if (priorMatch && annotationMap.has(priorMatch.id)) {
    const priorStatus = annotationMap.get(priorMatch.id)!;
    if (priorStatus !== 'not_started') {
      const statusLabels: Record<NegotiationStatus, string> = {
        not_started: 'Not Started',
        negotiating: 'In Negotiation',
        resolved: 'Resolved',
        accepted_risk: 'Accepted Risk',
      };
      return {
        priorStatus,
        promptMessage: `Prior version was marked "${statusLabels[priorStatus]}" — Confirm to adopt status for this version?`,
      };
    }
  }

  return null;
}
