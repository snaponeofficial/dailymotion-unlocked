-- Add progress tracking to video_views table
ALTER TABLE public.video_views 
ADD COLUMN IF NOT EXISTS progress_seconds integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration_seconds integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false;

-- Add UPDATE policy for video_views so users can update their progress
CREATE POLICY "Users can update their own video views"
ON public.video_views
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_views_user_video ON public.video_views(user_id, video_id);