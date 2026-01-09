-- Admin settings table for storing Xendit API key and Telegram settings
CREATE TABLE public.admin_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value text NOT NULL,
    encrypted boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can access settings
CREATE POLICY "Admins can view settings" ON public.admin_settings
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings" ON public.admin_settings
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert settings" ON public.admin_settings
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete settings" ON public.admin_settings
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Payment logs table for comprehensive payment tracking
CREATE TABLE public.payment_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email text,
    external_id text NOT NULL,
    amount numeric NOT NULL,
    currency text DEFAULT 'PHP',
    status text NOT NULL,
    payment_method text,
    invoice_url text,
    xendit_response jsonb,
    ip_address text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view all payment logs
CREATE POLICY "Admins can view all payment logs" ON public.payment_logs
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- System can insert logs
CREATE POLICY "System can insert payment logs" ON public.payment_logs
    FOR INSERT
    WITH CHECK (true);

-- User favorites table
CREATE TABLE public.user_favorites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    video_url text NOT NULL,
    video_title text,
    thumbnail_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, video_url)
);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can manage their own favorites
CREATE POLICY "Users can view their favorites" ON public.user_favorites
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON public.user_favorites
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete favorites" ON public.user_favorites
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Enhanced trial sessions with fingerprint and IP tracking
ALTER TABLE public.trial_sessions 
    ADD COLUMN IF NOT EXISTS ip_address text,
    ADD COLUMN IF NOT EXISTS fingerprint text,
    ADD COLUMN IF NOT EXISTS user_agent text,
    ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_trial_sessions_ip ON public.trial_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_trial_sessions_fingerprint ON public.trial_sessions(fingerprint);
CREATE INDEX IF NOT EXISTS idx_payment_logs_user ON public.payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created ON public.payment_logs(created_at DESC);

-- Add trigger for updated_at on admin_settings
CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.admin_settings (key, value, encrypted) VALUES
    ('telegram_bot_token', '', true),
    ('telegram_chat_id', '', false),
    ('notifications_enabled', 'false', false)
ON CONFLICT (key) DO NOTHING;