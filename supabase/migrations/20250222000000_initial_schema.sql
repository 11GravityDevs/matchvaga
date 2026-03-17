-- MatchVaga initial schema
-- Run via Supabase CLI: supabase db push
-- Or apply manually in Supabase Dashboard SQL Editor

-- resumes (parsed_data only, no file storage)
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parsed_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- analyses (job stored as snapshot, no job_descriptions table)
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  job_snapshot JSONB NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  optimized_score INTEGER CHECK (optimized_score >= 0 AND optimized_score <= 100),
  matched_skills_count INTEGER NOT NULL DEFAULT 0 CHECK (matched_skills_count >= 0),
  user_hard_skills JSONB NOT NULL DEFAULT '[]',
  user_soft_skills JSONB NOT NULL DEFAULT '[]',
  missing_hard_skills JSONB NOT NULL DEFAULT '[]',
  missing_soft_skills JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pending_payment', 'completed', 'abandoned')),
  optimized_resume_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_credits (analysis credits per user; row created on first purchase via webhook)
CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- optimized_documents (generated PDF/DOCX for download)
CREATE TABLE optimized_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'docx')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- purchases (payment idempotency and audit; webhook writes via service role; users can read own rows)
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  credits_granted INTEGER NOT NULL CHECK (credits_granted > 0),
  UNIQUE (payment_provider, external_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- pending PIX charges context for webhook reconciliation
CREATE TABLE pix_pending_charges (
  charge_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimized_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE pix_pending_charges ENABLE ROW LEVEL SECURITY;

-- Policies: users access only their own rows
CREATE POLICY "resumes_all_own" ON resumes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "analyses_all_own" ON analyses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_credits_all_own" ON user_credits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "optimized_documents_select_via_analysis" ON optimized_documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM analyses a WHERE a.id = analysis_id AND a.user_id = auth.uid()));
CREATE POLICY "optimized_documents_insert_via_analysis" ON optimized_documents FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM analyses a WHERE a.id = analysis_id AND a.user_id = auth.uid()));
CREATE POLICY "optimized_documents_delete_via_analysis" ON optimized_documents FOR DELETE
  USING (EXISTS (SELECT 1 FROM analyses a WHERE a.id = analysis_id AND a.user_id = auth.uid()));
CREATE POLICY "purchases_select_own" ON purchases FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "purchases_insert_own" ON purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pix_pending_charges_insert_own" ON pix_pending_charges FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pix_pending_charges_select_own" ON pix_pending_charges FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "pix_pending_charges_delete_own" ON pix_pending_charges FOR DELETE
  USING (auth.uid() = user_id);
