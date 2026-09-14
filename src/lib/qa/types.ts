import { SafetyStatus } from '../../types/database';
import { ExtractedChunkItem as ChunkItem } from '../intelligence/types';

export interface QARequest {
  documentId: string;
  documentVersionId: string;
  question: string;
  chunks: ChunkItem[];
  rawText?: string;
  userId?: string;
}

export interface AnswerCitation {
  chunkId: string;
  sectionTitle: string;
  pageStart: number | null;
  pageEnd: number | null;
  relevanceScore: number;
  quotedTextSnippet: string;
  sourceReference: string;
}

export interface QAResponse {
  questionId: string;
  answerId: string;
  question: string;
  answerText: string;
  confidence: number; // 0.0 - 1.0
  safetyStatus: SafetyStatus;
  isUnsupportedAnswer: boolean;
  citations: AnswerCitation[];
  suggestedFollowUpQuestions: string[];
}
