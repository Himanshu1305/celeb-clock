-- Create blog_drafts table
CREATE TABLE public.blog_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_drafts ENABLE ROW LEVEL SECURITY;

-- Admins can do everything on blog_drafts
CREATE POLICY "Admins can manage all blog_drafts"
ON public.blog_drafts FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create email_templates table
CREATE TABLE public.email_templates (
    template_type TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Admins can do everything on email_templates
CREATE POLICY "Admins can manage all email_templates"
ON public.email_templates FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create status_checks table (telemetry status check logs)
CREATE TABLE public.status_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.status_checks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert status checks
CREATE POLICY "Anyone can insert status_checks"
ON public.status_checks FOR INSERT
WITH CHECK (true);

-- Admins can view all status checks
CREATE POLICY "Admins can view status_checks"
ON public.status_checks FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));
