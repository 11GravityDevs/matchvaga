-- Storage bucket RLS policies for generated PDF/DOCX documents
-- Run after initial_schema

-- RLS: users can INSERT and SELECT only their own files (path: {user_id}/*)
CREATE POLICY "documents_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "documents_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
