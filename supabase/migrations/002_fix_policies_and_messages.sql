-- Users INSERT policy to allow profile creation after auth signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'users' 
      AND policyname = 'Users can insert their own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id)';
  END IF;
END $$;

-- Messages schema alignment with application code
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS message_type TEXT CHECK (message_type IN ('text', 'file')) DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Backfill: copy legacy attachment_url into file_url when present
UPDATE public.messages
SET file_url = attachment_url
WHERE attachment_url IS NOT NULL AND (file_url IS NULL OR file_url = '');

-- Optional: keep attachment_url for backward compatibility. If you want to drop it, uncomment:
-- ALTER TABLE public.messages DROP COLUMN IF EXISTS attachment_url;
