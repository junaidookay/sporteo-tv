-- Create avatars storage bucket if it doesn't exist
-- Note: Storage buckets are managed in Supabase dashboard, but this documents the setup

-- You need to:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New Bucket"
-- 3. Create bucket named "avatars"
-- 4. Set it to Public (allow public access)
-- 5. Configure file size limit to 10MB

-- Alternatively, you can create it via the Supabase API:
-- POST https://api.supabase.com/v1/projects/{project-id}/storage/buckets
-- Headers: Authorization: Bearer {api-key}
-- Body: {"name": "avatars", "public": true}
