-- Private bucket for generated PDF/DOCX + RLS on storage.objects
-- Run after initial_schema

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: users can only read their own files (path: {user_id}/*).
-- Uploads/deletes use service role on the server (document-export).
CREATE POLICY "documents_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
