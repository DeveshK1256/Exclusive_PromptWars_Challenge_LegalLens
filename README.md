# LegalLens AI — PromptWars Exclusive Challenge

> **🌐 Live Production App:** [https://exclusive-prompt-wars-challenge-leg-xi.vercel.app/](https://exclusive-prompt-wars-challenge-leg-xi.vercel.app/)
> **📁 Repository:** [https://github.com/DeveshK1256/Exclusive_PromptWars_Challenge_LegalLens](https://github.com/DeveshK1256/Exclusive_PromptWars_Challenge_LegalLens)

---

## 🏆 Challenge: AI for Legal Assistance & Access

> *"Legal information can often be complex, difficult to understand, and challenging to navigate without professional assistance. Build a GenAI-powered solution that makes legal information and basic legal assistance more accessible by helping users understand, compare, and navigate legal documents and information."*

**LegalLens AI** is a full-stack, production-deployed GenAI application that directly addresses every dimension of this problem statement. It combines Google Gemini's multimodal reasoning with deterministic safety gates, grounded citations, and a secure multi-tenant architecture to make legal documents accessible to everyone — regardless of legal expertise.

> ⚖️ **Important:** LegalLens AI provides general legal information and navigation assistance. It does **not** provide qualified legal advice and does not replace a licensed attorney.

---

## ✅ Use Case Coverage — All 7 Challenge Use Cases Implemented

The challenge lists 7 potential use cases. **LegalLens AI implements every single one:**

### 1. 📄 Simplifying Complex Legal Documents
**Challenge:** Make complex legal language understandable to non-experts.

**LegalLens Solution — Multi-Level Plain Language Simplification:**
- Generates **4 reading-level summaries** in a single Gemini `Promise.all` call: *Very Simple (5th grade)*, *Student*, *Professional*, and *Legal Terminology*
- Produces a **Key Terms Glossary** defining every technical legal term found in the document
- Generates an **Obligations Summary** listing what the user is explicitly required to do
- Powered by `gemini-2.5-flash` with structured prompts that enforce factual fidelity — no paraphrasing that changes meaning

---

### 2. 🔄 Comparing Contracts, Agreements, or Policies
**Challenge:** Allow users to compare two documents side-by-side.

**LegalLens Solution — Contract Comparison + Redline Diffing:**
- **Semantic Contract Comparison:** Gemini-powered clause-by-clause semantic matching between two user-owned documents, including **missing clause detection** (clauses present in one document but absent in the other)
- **Document Redline Diffing:** Line-by-line revision diffing with grounded AI change summaries — shows exactly what changed between document versions
- Security enforcement: both documents must belong to the requesting user (Row-Level Security enforced at DB layer)

---

### 3. 🔬 Highlighting Important Clauses, Obligations, Risks, or Inconsistencies
**Challenge:** Surface what matters most in a legal document.

**LegalLens Solution — Legal X-Ray Intelligence Engine:**
- Every clause finding carries **two independent classification axes**:
  - `severity_level`: `green` / `yellow` / `orange` / `red` (risk intensity)
  - `finding_kind`: `informational` / `action_required` / `deadline` (what action the user must take)
- **3D Spatial Layer Map:** Visual layer-map showing clause risk geography across the entire document
- **Negotiation Status Tracking:** Track clause negotiation status (*Not Started → In Progress → Agreed → Rejected → Resolved*) with private annotations
- All findings carry verbatim `source_reference` quotes traceable to the source paragraph — zero fabrication policy

---

### 4. 💬 Answering Questions Based on Provided Legal Documents
**Challenge:** Enable users to ask natural-language questions about their documents.

**LegalLens Solution — Grounded Document Q&A:**
- **Vector Retrieval Engine:** `gemini-embedding-001` embeddings with cosine similarity search across document chunks
- **Zero-Hallucination Gate:** Answers are only generated when retrieved chunks score above the similarity threshold. Every answer includes traceable `source_reference` citations pointing to exact document paragraphs
- **Inline Clause Q&A:** Instant contextual Q&A focused on a single selected clause — ask Gemini about any specific clause without leaving the analysis view
- **Well-Formed Fallback:** When a question cannot be grounded in the document, users receive a helpful fallback with 2-3 suggested follow-up topics that *are* present in the document — no hallucinated answers

---

### 5. 🎯 Helping Users Understand Their Options and Potential Next Steps
**Challenge:** Go beyond document analysis to guide users on what to do next.

**LegalLens Solution — Perspective-Aware Personal Impact + Action Plans:**
- **Role-Based Reframing:** Users set a `context_role` (Employee / Tenant / Freelancer / Consumer / Small Business Owner) and every X-Ray finding is re-explained through that specific lens
- **Action Plan Generator:** Produces a structured 4-step user journey from "Review these clauses" → "Negotiate these terms" → "Prepare these questions" → "Next legal step"
- **Portfolio Risk Scoring:** Deterministic risk grade (`A+` to `F`) aggregated across all user documents — helps users prioritize which contracts need attention first

---

### 6. 📝 Generating Summaries, Checklists, or Other Actionable Outputs
**Challenge:** Produce concrete, actionable outputs from legal analysis.

**LegalLens Solution — Checklists, Calendar Sync & Risk Reports:**
- **"Before You Sign" Checklist:** AI-generated pre-signature checklist identifying items to verify before signing
- **Deadline Reminders & Calendar Export:** DB-backed contract deadline tracking with 1-click `.ics` calendar export for Google Calendar / Apple Calendar / Outlook sync — dismissal state stored per user
- **Portfolio Risk Dashboard:** Aggregated risk grade and finding summary across all documents

---

### 7. 📋 Helping Users Prepare Questions for a Legal Professional
**Challenge:** Bridge the gap between AI assistance and professional legal consultation.

**LegalLens Solution — Lawyer Consultation Question Generator:**
- Synthesizes **targeted, clause-traceable questions** for users to bring to their attorney
- Questions are grounded to specific document findings — not generic legal questions
- Explicitly positioned as *preparation for a lawyer*, not a replacement — reinforcing the challenge's "information, not advice" requirement

---

## 🤖 GenAI Services Utilized

| GenAI Service | Where Used in LegalLens AI |
| :--- | :--- |
| **Google Gemini `gemini-2.5-flash`** | Document simplification (4 reading levels), Legal X-Ray finding classification, Personal Impact reframing, Action Plan generation, "Before You Sign" checklist, Lawyer question generation, Contract comparison, Redline change summaries |
| **Google Gemini `gemini-2.0-flash-exp`** | Grounded Document Q&A answers — generates responses strictly grounded to retrieved document chunks with traceable citations |
| **Google `gemini-embedding-001`** | Generates vector embeddings for all document chunks; powers cosine similarity retrieval for Q&A; O(1) LRU embedding cache (max 500 entries) eliminates redundant API calls |

All Gemini calls are server-side only (Next.js Route Handlers). The `GEMINI_API_KEY` is never exposed to the browser.

### 🔥 Real-Time Gemini API Calls — Every Dashboard Tab

Every analysis tab in the dashboard triggers a **live, real-time Gemini API call** when opened. There is no pre-computed or cached mock data — the user sees a "Gemini AI is analysing…" loading spinner while the model processes their document:

| Dashboard Tab | API Route Called | Gemini Agent Invoked | What It Returns |
| :--- | :--- | :--- | :--- |
| **Analysis Report (X-Ray)** | `POST /api/documents/[id]/xray` | `runLegalXRayAgent` | AI-classified findings by severity + finding_kind with source citations |
| **Simplification** | `POST /api/documents/[id]/simplify` | `runSimplificationAgent` | 4-level summaries + glossary + obligations via `Promise.all` |
| **Grounded Q&A** | `POST /api/documents/[id]/qa` | `runGroundedQAAgent` | Vector-retrieved, citation-grounded answers |
| **Timeline** | `POST /api/documents/[id]/timeline` | `runLegalTimelineAgent` | AI-extracted dates, deadlines, and milestones |
| **Action Plan** | `POST /api/documents/[id]/action-plan` | `runActionPlanAgent` | Checklist, lawyer questions, and action items |
| **Personal Impact** | `POST /api/documents/[id]/impact` | `runPersonalImpactAgent` | Role-aware reframing of findings |
| **Contract Comparison** | `POST /api/documents/compare` | `runComparisonAgent` | Semantic clause matching + missing clause detection |

Results are cached client-side per document ID so switching tabs doesn't re-fetch — but the **initial analysis for each document is always a live Gemini call**.

---

## 🛡️ Safety & Guardrails

The challenge explicitly requires solutions to "provide information and assistance, rather than replace professional legal advice." LegalLens AI enforces this at every layer:

1. **Jurisdiction-Neutral Language:** Clauses are flagged using neutral phrasing ("potential attention area," "consider reviewing") rather than definitive legal conclusions unless supported by reliable jurisdiction-aware evidence
2. **Traceable Citations:** Every AI finding includes a valid `source_reference` field pointing to the verbatim source paragraph — no fabricated citations ever ship
3. **Prompt Injection Defense:** Uploaded document content is treated as untrusted data, sandboxed within `<document_content>` tags in all prompts
4. **Multi-Tenant Data Isolation:** 13-entity Supabase Row-Level Security (RLS) policies enforce complete isolation — no document ever leaks across user accounts
5. **Explicit Disclaimer:** Persistent "Not Legal Advice" notice on all analysis pages

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| **AI & Reasoning** | Google Gemini (`gemini-2.5-flash`, `gemini-2.0-flash-exp`, `gemini-embedding-001`) |
| **Document Parsing** | `pdf-parse` (PDF), `mammoth` (DOCX), native text (TXT) |
| **Database & Auth** | Supabase PostgreSQL with 13 Row-Level Security policies |
| **Storage** | Supabase Storage (private signed URLs only — never public) |
| **Deployment** | Vercel (Production) |
| **Testing** | Vitest (172 unit/integration tests) + Playwright (19 E2E tests) |

---

## 🚦 Getting Started (Local Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DeveshK1256/Exclusive_PromptWars_Challenge_LegalLens.git
   cd "Challenge 1_LegalLens"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables** — create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-url.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

5. **Run tests:**
   ```bash
   npm test          # 172 Vitest unit/integration tests
   npm run test:e2e  # 19 Playwright E2E tests
   npm run build     # Production build verification
   ```

---

## 📜 Disclaimer

LegalLens AI provides general legal information and document navigation assistance. It does **not** provide qualified legal advice and does not replace a licensed attorney. Users are encouraged to consult a qualified legal professional for advice specific to their situation.

---

## 🚀 Live App & Key Feature Set

- **🌐 Live Production URL:** [https://exclusive-prompt-wars-challenge-leg-xi.vercel.app/](https://exclusive-prompt-wars-challenge-leg-xi.vercel.app/)
- **📄 Secure Document Upload & Extraction:** Supports PDF, DOCX, and TXT legal document uploads with strict extension validation and path traversal defense.
- **🔬 Legal X-Ray Intelligence:** Classifies findings by `severity_level` (*green / yellow / orange / red*) and `finding_kind` (*informational / action_required / deadline*) with verbatim source citations.
- **🎯 Perspective-Aware Impact:** Tailors Personal Impact explanations to user roles (`context_role`: Employee, Tenant, Freelancer, Consumer, Small Business Owner).
- **💡 Plain-Language Simplification:** Generates multi-level summaries (*Very Simple, Student, Professional, Legal Terminology*), Key Terms Glossaries, and Obligations summaries.
- **💬 Grounded Document Q&A:** Interactive Q&A backed by vector search and strict zero-hallucination gates requiring traceable `source_reference` quotes.
- **🔄 Contract Comparison:** Compares clause-by-clause differences between two documents owned by the user with missing clause detection.
- **📅 Deadline Reminders & Calendar Export:** DB-backed contract deadline tracking with 1-click `.ics` calendar sync and dismissal state per user.
- **🏷️ Finding Negotiation Status:** Track clause negotiation status (*Not Started, In Progress, Agreed, Rejected, Resolved*) with private annotations.
- **📊 Portfolio Risk Scoring:** Deterministic portfolio risk grade (`A+` to `F`) aggregated across all user-owned completed documents.
- **📝 Document Redline Diffing:** Line-by-line contract revision diffing with grounded AI change summaries.
- **💬 Inline Clause Q&A:** Instant contextual Q&A focused on a single selected clause.
- **🔗 Secure Rate-Limited Shared Links:** Share read-only X-Ray & summary links protected by 256-bit CSPRNG token hashing, rate limits, and instant revocation.

---

## 🎯 Alignment with Problem Statement: AI for Legal Assistance & Access

LegalLens AI maps 1-to-1 against all 7 potential use cases specified in the challenge theme:

| Challenge Potential Use Case | LegalLens AI Built Solution | Key Feature Implementation |
| :--- | :--- | :--- |
| **1. Simplifying complex legal documents** | Multi-Level Simplification & Glossaries | 4 complexity levels (*Very Simple* 5th-grade to *Legal Terminology*), Key Terms Glossary, and factual fidelity auditing pass. |
| **2. Comparing contracts, agreements, or policies** | Contract Comparison & Redline Diffing | Dual-document clause matching, missing clause detection, and line-by-line redline revision diffing with AI change summaries. |
| **3. Highlighting important clauses, obligations, risks** | Legal X-Ray & 3D Spatial Layer Map | Dual classification by `severity_level` (*green/yellow/orange/red*) AND `finding_kind` (*informational/action_required/deadline*) + 3D layer map. |
| **4. Answering questions based on legal documents** | Grounded Document Q&A & Inline Q&A | Vector retrieval engine (`gemini-embedding-001`) with Zero-Hallucination Gate requiring traceable `source_reference` citations. |
| **5. Helping users understand options & next steps** | Perspective-Aware Impact & Action Plans | Role-based reframing (`context_role`: Employee, Tenant, Freelancer, Consumer, Small Business) + 4-step user journey navigator. |
| **6. Generating summaries, checklists, actionable outputs** | "Before You Sign" Checklist & Calendar Export | Pre-signature checklists, 1-click `.ics` calendar deadline export, and deterministic Portfolio Risk Grades (`A+` to `F`). |
| **7. Preparing questions for a legal professional** | Lawyer Consultation Question Generator | Synthesizes targeted, clause-traceable questions for users to take into professional legal consultations. |

---

## 🛡️ Product Guardrails & Absolute Safety Rules

1. **Information, Not Legal Advice:** LegalLens AI provides legal information and navigation assistance, not professional legal advice.
2. **Untrusted Data Grounding:** Uploaded documents are treated as untrusted data; prompt injection vectors are strictly contained within security tags.
3. **Traceable Citations:** All AI insights include valid `source_reference` links to original document text.
4. **Jurisdiction-Neutral Language:** Clauses are flagged using jurisdiction-neutral phrasing ("potential attention area") rather than definitive statutory claims unless explicitly supported.
5. **Row-Level Security (RLS):** 13-entity Supabase RLS policies ensuring complete multi-tenant data isolation across all user documents, findings, shared links, and annotations.


## 📜 Disclaimer

LegalLens AI provides general legal information and document navigation assistance. It does **not** provide qualified legal advice and does not replace a licensed attorney. Users are encouraged to consult a qualified legal professional for advice specific to their situation.

