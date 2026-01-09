-- Site branding settings (for admin to customize)
INSERT INTO public.admin_settings (key, value, encrypted) VALUES
    ('site_name', 'DailyWatch', false),
    ('site_tagline', 'Ad-Free Dailymotion Experience', false),
    ('site_favicon', '', false),
    ('site_logo', '', false),
    ('site_primary_color', '#22d3ee', false)
ON CONFLICT (key) DO NOTHING;

-- User watch queue/my list table
CREATE TABLE public.user_watchlist (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    video_url text NOT NULL,
    video_id text,
    title text,
    thumbnail_url text,
    added_at timestamp with time zone NOT NULL DEFAULT now(),
    watched boolean DEFAULT false,
    UNIQUE(user_id, video_url)
);

-- Enable RLS
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;

-- Users can manage their own watchlist
CREATE POLICY "Users can view their watchlist" ON public.user_watchlist
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add to watchlist" ON public.user_watchlist
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update watchlist" ON public.user_watchlist
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from watchlist" ON public.user_watchlist
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Add video title to video_views for better history display
ALTER TABLE public.video_views 
    ADD COLUMN IF NOT EXISTS video_title text,
    ADD COLUMN IF NOT EXISTS video_id text,
    ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_watchlist_user ON public.user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watchlist_added ON public.user_watchlist(added_at DESC);