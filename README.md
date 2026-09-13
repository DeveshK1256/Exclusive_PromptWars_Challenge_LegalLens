# LegalLens AI — Exclusive PromptWars Challenge

[![Netlify Status](https://api.netlify.com/api/v1/badges/2ef02395-caac-4964-a016-fa09218229cb/deploy-status)](https://app.netlify.com/sites/legallens-ai-app/deploys)

> **Live Production Application:** [https://legallens-ai-app.netlify.app](https://legallens-ai-app.netlify.app)

**LegalLens AI** is an AI Legal Navigation Assistant designed to help people understand, compare, and navigate complex legal documents in plain language.

---

## 🚀 Live App & Key Features

- **🌐 Live Production URL:** [https://legallens-ai-app.netlify.app](https://legallens-ai-app.netlify.app)
- **📄 Secure Document Upload & Extraction:** Supports PDF, DOCX, and TXT legal document uploads (up to 25 MB).
- **🔬 Legal X-Ray Intelligence:** Classifies findings by `severity_level` (*green / yellow / orange / red*) and `finding_kind` (*informational / action_required / deadline*).
- **🎯 Context-Aware Role Impact:** Adapts explanations to the user's perspective (`context_role`: Employee, Tenant, Freelancer, Consumer, Small Business Owner).
- **💡 Plain-Language Simplification:** Generates non-jargon summaries, custom glossaries, and adjustable complexity levels.
- **💬 Grounded Document Q&A:** Answers user queries with direct source citations and traceable `source_reference` evidence.
- **🔄 Contract Comparison:** Compares clause-by-clause differences between two documents owned by the user.
- **📅 Legal Timeline & Action Plans:** Maps critical dates, deadlines, obligations, and step-by-step next actions.

---

## 🛡️ Product Guardrails & Absolute Safety Rules

1. **Information, Not Legal Advice:** LegalLens AI provides legal information and navigation assistance, not professional legal advice.
2. **Untrusted Data Grounding:** Uploaded documents are treated as untrusted data; prompt injection vectors are strictly contained.
3. **Traceable Citations:** All AI insights include valid `source_reference` links to the original document text.
4. **Jurisdiction-Neutral Language:** Clauses are flagged as "potential attention areas" rather than definitive legal conclusions.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **AI & Reasoning:** Google Gemini (`gemini-3.6-flash` / `gemini-3.1-pro-preview`)
- **Document Processing:** `pdf-parse`, `mammoth` (DOCX)
- **Authentication & Security:** Supabase Auth + RLS policies
- **Testing:** Vitest (64 / 64 tests passing 100%)
- **Deployment:** Netlify Production Deployment

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
