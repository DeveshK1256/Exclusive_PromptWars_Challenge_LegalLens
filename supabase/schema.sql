-- LegalLens AI Schema Definitions (Section 9.1 of LegalLens Master Spec)
-- Enables Row-Level Security (RLS) on all tables

-- Custom Enums
CREATE TYPE document_type_enum AS ENUM (
  'employment_contract',
  'nda',
  'rental_agreement',
  'service_agreement',
  'loan_document',
  'policy_document',
  'terms_of_service',
  'other'
);

CREATE TYPE severity_level_enum AS ENUM (
  'green',
  'yellow',
  'orange',
  'red'
);

CREATE TYPE finding_kind_enum AS ENUM (
  'informational',
  'action_required',
  'deadline'
);

CREATE TYPE finding_type_enum AS ENUM (
  'fact',
  'ai_interpretation',
  'general_information',
  'recommendation'
);

CREATE TYPE safety_status_enum AS ENUM (
  'passed',
  'flagged_for_review',
  'blocked'
);

-- Profiles Table (Context Role for Personal Impact)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  preferred_language TEXT, -- reserved for V1.1
  context_role TEXT, -- e.g. Employee, Tenant, Freelancer, Business owner, Consumer, Student, Other
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents Table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_hash TEXT NOT NULL, -- SHA-256 hash to detect duplicate user uploads
  storage_path TEXT NOT NULL,
  document_type document_type_enum NOT NULL DEFAULT 'other',
  jurisdiction TEXT, -- Optional, user-supplied free text; never inferred
  status TEXT NOT NULL DEFAULT 'uploaded', -- uploaded, validating, extracting, analyzing, completed, failed
  deleted_at TIMESTAMPTZ, -- Soft delete flag
  retention_expires_at TIMESTAMPTZ, -- Scheduled hard purge
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document Versions Table
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INT NOT NULL DEFAULT 1,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(document_id, version_number)
);

-- Document Sections Table
CREATE TABLE document_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
  parent_section_id UUID REFERENCES document_sections(id) ON DELETE CASCADE,
  title TEXT,
  section_type TEXT,
  order_index INT NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  page_start INT,
  page_end INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document Chunks Table
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
  section_id UUID REFERENCES document_sections(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INT NOT NULL DEFAULT 0,
  embedding_reference TEXT,
  page_start INT,
  page_end INT,
  token_count INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document Entities Table
CREATE TABLE document_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- party, organization, person, date, amount, location, obligation
  entity_value TEXT NOT NULL,
  normalized_value TEXT,
  source_reference TEXT NOT NULL, -- Traceable evidence reference
  confidence FLOAT NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clauses Table
CREATE TABLE clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
  section_id UUID REFERENCES document_sections(id) ON DELETE CASCADE,
  clause_type TEXT NOT NULL,
  title TEXT NOT NULL,
  original_text TEXT NOT NULL,
  plain_explanation TEXT NOT NULL,
  severity_level severity_level_enum NOT NULL DEFAULT 'green',
  finding_kind finding_kind_enum NOT NULL DEFAULT 'informational',
  confidence FLOAT NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  source_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Findings Table
CREATE TABLE findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
  clause_id UUID REFERENCES clauses(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  severity severity_level_enum NOT NULL DEFAULT 'green',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  finding_type finding_type_enum NOT NULL DEFAULT 'ai_interpretation',
  confidence FLOAT NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  source_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Timelines Table
CREATE TABLE timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  source_reference TEXT NOT NULL,
  confidence FLOAT NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions Table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Answers Table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  confidence FLOAT NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  safety_status safety_status_enum NOT NULL DEFAULT 'passed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Answer Sources Table
CREATE TABLE answer_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
  relevance_score FLOAT NOT NULL CHECK (relevance_score >= 0.0 AND relevance_score <= 1.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document Summaries Table (Sprint 6 — Multi-Level Simplification)
CREATE TABLE document_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
  complexity_level TEXT NOT NULL DEFAULT 'very_simple', -- very_simple, student, professional, legal_terminology
  summary_text TEXT NOT NULL,
  key_takeaways JSONB NOT NULL DEFAULT '[]'::jsonb,
  obligations_summary TEXT NOT NULL, -- Synthesized from validated clauses/findings
  confidence FLOAT NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(document_version_id, complexity_level)
);

-- Glossary Terms Table (Sprint 6 — Key Terms Glossary)
CREATE TABLE glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  plain_language_definition TEXT NOT NULL,
  contextual_meaning TEXT NOT NULL,
  source_reference TEXT NOT NULL, -- Traceable evidence reference
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comparisons Table (Access Control: Requiring ownership of BOTH referenced documents)
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_a_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  document_b_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comparison Findings Table
CREATE TABLE comparison_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comparison_id UUID NOT NULL REFERENCES comparisons(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  document_a_value TEXT,
  document_b_value TEXT,
  difference_summary TEXT NOT NULL,
  severity_level severity_level_enum NOT NULL DEFAULT 'green',
  finding_kind finding_kind_enum NOT NULL DEFAULT 'informational',
  confidence FLOAT NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Action Plans Table
CREATE TABLE action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Action Items Table
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_plan_id UUID NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  related_finding_id UUID REFERENCES findings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lawyer Questions Table
CREATE TABLE lawyer_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  reason TEXT NOT NULL,
  related_finding_id UUID REFERENCES findings(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analysis Jobs Table
CREATE TABLE analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  progress INT NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Runs Table
CREATE TABLE ai_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  model TEXT NOT NULL,
  input_version TEXT,
  output_version TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  token_usage INT NOT NULL DEFAULT 0,
  latency_ms INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_type TEXT NOT NULL DEFAULT 'user', -- user, system, agent
  action TEXT NOT NULL, -- e.g. document_deleted, document_purged, cross_user_access_denied
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read/write own profile" ON profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own documents" ON documents
  FOR ALL USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Strict Access Control for Comparisons (Both Documents Must Belong to Requesting User)
CREATE POLICY "Users can access comparisons when owning BOTH documents" ON comparisons
  FOR ALL USING (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM documents doc1 WHERE doc1.id = document_a_id AND doc1.user_id = auth.uid()) AND
    EXISTS (SELECT 1 FROM documents doc2 WHERE doc2.id = document_b_id AND doc2.user_id = auth.uid())
  );

CREATE POLICY "Users can read own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);
