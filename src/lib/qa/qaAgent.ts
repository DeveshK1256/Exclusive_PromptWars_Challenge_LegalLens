import { QARequest, QAResponse, AnswerCitation } from './types';
import { DOCUMENT_CONFIG } from '../config';
import { AI_CONFIG } from '../ai/config';
import { getGeminiClient, recordAIRunLog, callGeminiWithRetry } from '../ai/gemini';
import { SYSTEM_PROMPT_QA, UNTRUSTED_DOC_START, UNTRUSTED_DOC_END } from '../ai/prompts';
import { retrieveRelevantChunks } from '../intelligence/retrieval';

/**
 * Grounded Document Q&A Agent (Section 3.5 & 3.10 of Master Spec)
 * Executed Workflow:
 * Question -> Dense Vector Retrieval -> Validate Relevance -> Gemini Answer Generation
 * -> Attach Citations -> Safety & Injection Check -> Response
 */
export async function runGroundedQAAgent(request: QARequest): Promise<QAResponse> {
  const start = Date.now();
  const modelName = AI_CONFIG.reasoningModel;
  const questionId = `q_${Date.now()}`;
  const answerId = `ans_${Date.now()}`;

  // 1. Prompt Injection Security Scan on User Question
  const injectionDetected = checkPromptInjection(request.question);
  if (injectionDetected) {
    return {
      questionId,
      answerId,
      question: request.question,
      answerText: 'LegalLens AI Security System: The provided input contains instruction-override directives aimed at the system and cannot be processed.',
      confidence: 0.0,
      safetyStatus: 'blocked',
      isUnsupportedAnswer: true,
      citations: [],
      suggestedFollowUpQuestions: ['Can I ask a question specifically about this document?'],
    };
  }

  // 2. Dense Vector Retrieval (retrieve top relevant chunks)
  const allRetrieved = await retrieveRelevantChunks(
    request.question,
    request.chunks,
    5
  );

  const topRelevanceScore = allRetrieved.length > 0 ? allRetrieved[0].relevanceScore : 0;

  // 3. Evidence Relevance Validation & Unsupported-Answer Fallback (Zero-Hallucination Gate)
  if (allRetrieved.length === 0 || topRelevanceScore < DOCUMENT_CONFIG.qaRelevanceThreshold) {
    const topic = extractTopicFromQuestion(request.question);
    return {
      questionId,
      answerId,
      question: request.question,
      answerText: `This document does not contain information about ${topic}.`,
      confidence: 0.0,
      safetyStatus: 'passed',
      isUnsupportedAnswer: true,
      citations: [],
      suggestedFollowUpQuestions: [
        'What are the main termination clauses in this document?',
        'What obligations or payment terms are specified?',
      ],
    };
  }

  const retrievalResults = allRetrieved.filter((r) => r.relevanceScore >= DOCUMENT_CONFIG.qaRelevanceThreshold);

  // 4. Format retrieved evidence inside <untrusted_document> security tags
  const evidenceText = retrievalResults
    .map(
      (res, idx) =>
        `[Chunk ${idx + 1} | Section: ${res.chunk.section_id || 'General'} | Ref: Page ${res.chunk.page_start || 1}]: ${res.chunk.content}`
    )
    .join('\n\n');

  const promptInput = `${SYSTEM_PROMPT_QA}\n\nQuestion: "${request.question}"\n\n${UNTRUSTED_DOC_START}\n${evidenceText}\n${UNTRUSTED_DOC_END}`;

  // 5. Generate Grounded Answer via Gemini
  let answerText = '';
  let tokenUsage = Math.ceil(promptInput.length / 4);

  const apiKey = process.env.GEMINI_API_KEY;
  const isVitest = process.env.VITEST === 'true';
  const isLiveTestMode = process.env.RUN_LIVE_GEMINI_TESTS === 'true';
  const shouldCallGemini = Boolean(apiKey && apiKey !== 'dummy_gemini_key' && (!isVitest || isLiveTestMode));

  if (shouldCallGemini) {
    try {
      const ai = getGeminiClient();
      const response = await callGeminiWithRetry(ai, {
        model: modelName,
        contents: promptInput,
      });

      if (response.text) {
        answerText = response.text.trim();
      }
    } catch (err: any) {
      if (process.env.RUN_LIVE_GEMINI_TESTS === 'true') throw err;
    }
  }

  if (!answerText) {
    answerText = generateDeterministicGroundedAnswer(request.question, retrievalResults);
  }

  // Build Citations traceable to raw document chunks (Zero-Hallucination Gate)
  const citations: AnswerCitation[] = retrievalResults.map((res) => {
    const snippet = res.chunk.content.substring(0, 150);
    const sourceRef = `Page ${res.chunk.page_start || 1}${res.chunk.page_end && res.chunk.page_end !== res.chunk.page_start ? `-${res.chunk.page_end}` : ''}`;

    return {
      chunkId: res.chunk.id,
      sectionTitle: res.chunk.section_id || 'Document Provision',
      pageStart: res.chunk.page_start,
      pageEnd: res.chunk.page_end,
      relevanceScore: res.relevanceScore,
      quotedTextSnippet: snippet,
      sourceReference: sourceRef,
    };
  });

  const validatedCitations = citations.filter((c) => c.quotedTextSnippet.length > 0);
  const duration = Date.now() - start;

  recordAIRunLog({
    documentId: request.documentId,
    agentType: 'qa',
    model: modelName,
    tokenUsage,
    latencyMs: duration,
    status: 'completed',
  });

  // Check if generated answer explicitly states content is absent from document
  const isAbsentResponse =
    /does not (?:contain|mention|specify|provide|state|include)|not (?:found|mentioned|discussed|addressed|stated|provided|specified) in (?:the|this) document|cannot be found|no (?:information|mention|reference|details) (?:is|are|was|were) (?:found|provided|contained|available)/i.test(
      answerText
    );

  if (isAbsentResponse) {
    return {
      questionId,
      answerId,
      question: request.question,
      answerText: `This document does not contain information about ${extractTopicFromQuestion(request.question)}.`,
      confidence: 0.0,
      safetyStatus: 'passed',
      isUnsupportedAnswer: true,
      citations: [],
      suggestedFollowUpQuestions: [
        'What are the main termination clauses in this document?',
        'What obligations or payment terms are specified?',
      ],
    };
  }

  return {
    questionId,
    answerId,
    question: request.question,
    answerText,
    confidence: Number(topRelevanceScore.toFixed(2)),
    safetyStatus: 'passed',
    isUnsupportedAnswer: false,
    citations: validatedCitations,
    suggestedFollowUpQuestions: generateSuggestedFollowUps(request.question, retrievalResults),
  };
}

function checkPromptInjection(text: string): boolean {
  const injectionPatterns = [
    /\bignore\s+previous\s+instructions\b/i,
    /\bdisregard\s+all\s+prior\s+prompts\b/i,
    /\bprint\s+system\s+key\b/i,
    /\broleplay\s+as\b/i,
    /\byou\s+are\s+now\s+dan\b/i,
  ];
  return injectionPatterns.some((pattern) => pattern.test(text));
}

function extractTopicFromQuestion(question: string): string {
  const cleaned = question
    .replace(/^(what|who|where|when|why|how|is|are|does|can|tell\s+me|explain)\s+/i, '')
    .replace(/[?.!]/g, '')
    .trim();
  return cleaned || 'this topic';
}

function generateDeterministicGroundedAnswer(question: string, retrievalResults: any[]): string {
  const topChunk = retrievalResults[0]?.chunk;
  if (!topChunk) return 'Based on the document text provided, no relevant details were found.';

  const STOP_WORDS = new Set(['what', 'where', 'when', 'which', 'that', 'this', 'from', 'have', 'with', 'will', 'would', 'should', 'could', 'about', 'does', 'your', 'their', 'them', 'is', 'are', 'the']);
  const queryWords = question
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const chunkTextLower = retrievalResults.map((r) => r.chunk.content.toLowerCase()).join(' ');
  const hasKeywordMatch = queryWords.some((qw) => chunkTextLower.includes(qw.length > 4 ? qw.substring(0, 4) : qw));

  if (!hasKeywordMatch && queryWords.length > 0) {
    return `This document does not contain information about ${extractTopicFromQuestion(question)}.`;
  }

  return `Based on the document text (Ref: Page ${topChunk.page_start || 1}): ${topChunk.content.substring(0, 220)}...`;
}

function generateSuggestedFollowUps(question: string, retrievalResults: any[]): string[] {
  return [
    'What notice period is required for this provision?',
    'What are the penalties or exceptions associated with this term?',
    'Can you explain this in simpler terms?',
  ];
}
