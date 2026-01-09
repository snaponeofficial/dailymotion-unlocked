-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for admin detection
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    UNIQUE (user_id, role)
);

-- Create subscriptions table for payment tracking
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'pending')),
    payment_id TEXT,
    payment_method TEXT DEFAULT 'xendit',
    amount NUMERIC(10,2) DEFAULT 49.00,
    currency TEXT DEFAULT 'PHP',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trial_sessions table for 15-min free trials
CREATE TABLE public.trial_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '15 minutes'),
    video_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_logs table for admin dashboard
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create video_views table for tracking
CREATE TABLE public.video_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    video_url TEXT NOT NULL,
    watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.subscriptions
        WHERE user_id = _user_id
          AND status = 'active'
    )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
    ON public.user_roles FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
    ON public.subscriptions FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all subscriptions"
    ON public.subscriptions FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- Trial sessions policies (public for anonymous access)
CREATE POLICY "Anyone can create trial sessions"
    ON public.trial_sessions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can view trial sessions"
    ON public.trial_sessions FOR SELECT
    USING (true);

CREATE POLICY "Anyone can update trial sessions"
    ON public.trial_sessions FOR UPDATE
    USING (true);

-- Activity logs policies
CREATE POLICY "Admins can view all logs"
    ON public.activity_logs FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert logs"
    ON public.activity_logs FOR INSERT
    WITH CHECK (true);

-- Video views policies
CREATE POLICY "Users can view their own video history"
    ON public.video_views FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video views"
    ON public.video_views FOR INSERT
    WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Admins can view all video views"
    ON public.video_views FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    INSERT INTO public.subscriptions (user_id, status)
    VALUES (NEW.id, 'inactive');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();