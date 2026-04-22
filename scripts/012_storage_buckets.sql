-- Create thumbnails storage bucket
-- Run this SQL in Supabase Dashboard → SQL Editor

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('thumbnails', 'thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'thumbnails');

CREATE POLICY "Allow Uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'thumbnails');

-- Also allow avatars to be used for thumbnails if needed
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Allow public access to avatars
CREATE POLICY "Public Access Avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Allow Uploads Avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');