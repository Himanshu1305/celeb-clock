-- Create blog_posts table for automated and manual blog content
CREATE TABLE public.blog_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    title text NOT NULL,
    meta_title text,
    excerpt text NOT NULL,
    meta_description text,
    content text NOT NULL,
    author text DEFAULT 'Team Celeb Clock',
    author_bio text,
    category text NOT NULL,
    tags text[] DEFAULT '{}',
    keywords text[] DEFAULT '{}',
    featured_image text,
    og_image text,
    read_time integer DEFAULT 5,
    faqs jsonb DEFAULT '[]',
    
    -- Approval workflow
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'published', 'rejected')),
    reviewed_by uuid,
    review_notes text,
    
    -- Auto-generation metadata
    is_auto_generated boolean DEFAULT false,
    generation_prompt text,
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    published_at timestamptz,
    scheduled_for timestamptz
);

-- Indexes for performance
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts only
CREATE POLICY "Public can view published posts"
ON public.blog_posts FOR SELECT
USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins can manage all posts"
ON public.blog_posts FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();