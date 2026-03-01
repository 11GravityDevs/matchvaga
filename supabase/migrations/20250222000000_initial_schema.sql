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
  matched_skills JSONB NOT NULL DEFAULT '[]',
  missing_technical_skills JSONB NOT NULL DEFAULT '[]',
  missing_behavioral_skills JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- optimized_documents (generated PDF/DOCX for download)
CREATE TABLE optimized_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'docx')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimized_documents ENABLE ROW LEVEL SECURITY;

-- Policies: users access only their own rows
CREATE POLICY "resumes_all_own" ON resumes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "analyses_all_own" ON analyses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "optimized_documents_select_via_analysis" ON optimized_documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM analyses a WHERE a.id = analysis_id AND a.user_id = auth.uid()));
CREATE POLICY "optimized_documents_insert_via_analysis" ON optimized_documents FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM analyses a WHERE a.id = analysis_id AND a.user_id = auth.uid()));
