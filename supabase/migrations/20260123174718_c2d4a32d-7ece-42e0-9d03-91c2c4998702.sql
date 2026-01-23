-- 1. Update email_notifications default to true
ALTER TABLE public.profiles 
ALTER COLUMN email_notifications SET DEFAULT true;

-- 2. Create analytics_events table for tracking page views, feature usage, and blog reads
CREATE TABLE public.analytics_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    session_id text,
    event_type text NOT NULL,
    event_name text NOT NULL,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for fast queries
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_name ON public.analytics_events(event_name);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics (for tracking anonymous and authenticated users)
CREATE POLICY "Anyone can insert analytics"
ON public.analytics_events FOR INSERT
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view analytics"
ON public.analytics_events FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Update handle_new_user trigger to include email_notifications = true
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    name, 
    email, 
    first_name, 
    last_name, 
    country,
    blog_subscription,
    email_notifications
  )
  VALUES (
    NEW.id,
    COALESCE(
      CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      ),
      COALESCE(NEW.raw_user_meta_data->>'name', '')
    ),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    true,
    true
  );
  RETURN NEW;
END;
$function$;