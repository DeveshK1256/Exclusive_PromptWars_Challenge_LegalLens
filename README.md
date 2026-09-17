# LegalLens AI — Exclusive PromptWars Challenge

> **Live Production Application:** [https://exclusive-prompt-wars-challenge-leg-xi.vercel.app/](https://exclusive-prompt-wars-challenge-leg-xi.vercel.app/)

**LegalLens AI** is an AI Legal Navigation Assistant designed to help users understand, compare, and navigate complex legal documents in plain language. It combines deterministic legal risk scoring, grounded Gemini reasoning, and multi-tenant security guardrails to provide clear, actionable document intelligence.

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

## 🛡️ Product Guardrails & Absolute Safety Rules

1. **Information, Not Legal Advice:** LegalLens AI provides legal information and navigation assistance, not professional legal advice.
2. **Untrusted Data Grounding:** Uploaded documents are treated as untrusted data; prompt injection vectors are strictly contained within security tags.
3. **Traceable Citations:** All AI insights include valid `source_reference` links to original document text.
4. **Jurisdiction-Neutral Language:** Clauses are flagged using jurisdiction-neutral phrasing ("potential attention area") rather than definitive statutory claims unless explicitly supported.
5. **Row-Level Security (RLS):** 13-entity Supabase RLS policies ensuring complete multi-tenant data isolation across all user documents, findings, shared links, and annotations.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, 3D Spatial Canvas
- **AI & Reasoning:** Google Gemini (`gemini-3.6-flash` / `gemini-3.1-pro-preview`)
- **Document Processing:** `pdf-parse`, `mammoth` (DOCX)
- **Database & Auth:** Supabase PostgreSQL with 13 Row-Level Security (RLS) policies
- **Testing:** 
  - **Vitest Unit & Integration:** 171 / 171 tests passing (28 test files)
  - **Playwright E2E Regression:** 19 / 19 E2E browser tests passing
- **Deployment:** Vercel Production Deployment

---

## 🚦 Getting Started (Local Development)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Challenge 1_LegalLens"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-url.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Run tests & build:**
   ```bash
   npm test
   npm run build
   ```

---

## 📜 Disclaimer

LegalLens AI provides general legal information and document navigation assistance. It does **not** provide qualified legal advice and does not replace a licensed attorney.
