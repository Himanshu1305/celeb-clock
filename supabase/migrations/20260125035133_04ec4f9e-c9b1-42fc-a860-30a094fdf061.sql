-- Create user_reviews table for testimonials and user submissions
CREATE TABLE public.user_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    rating integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    country text,
    display_name text NOT NULL,
    is_approved boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT rating_check CHECK (rating >= 1 AND rating <= 5)
);

-- Enable RLS
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

-- Users can create their own reviews
CREATE POLICY "Users can insert their own review"
ON public.user_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own reviews
CREATE POLICY "Users can view their own reviews"
ON public.user_reviews
FOR SELECT
USING (auth.uid() = user_id);

-- Public can view approved reviews
CREATE POLICY "Public can view approved reviews"
ON public.user_reviews
FOR SELECT
USING (is_approved = true);

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews"
ON public.user_reviews
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update reviews
CREATE POLICY "Admins can update reviews"
ON public.user_reviews
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete reviews
CREATE POLICY "Admins can delete reviews"
ON public.user_reviews
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_user_reviews_updated_at
BEFORE UPDATE ON public.user_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed 7 humanized testimonials (using a placeholder UUID for seeded data)
INSERT INTO public.user_reviews (user_id, rating, title, content, country, display_name, is_approved, is_featured) VALUES
('00000000-0000-0000-0000-000000000001', 5, 'Finally, an accurate age calculator!', 'I''ve tried so many age calculators online, but this one actually gets it right down to the second! Love checking my exact age on my birthday morning - it''s become a fun little tradition for our family.', 'United States', 'Sarah Mitchell', true, true),
('00000000-0000-0000-0000-000000000002', 5, 'Life expectancy feature is eye-opening', 'The life expectancy calculator really opened my eyes about my health habits. Made some positive changes after seeing the results. Simple interface, powerful insights. Highly recommended!', 'Canada', 'James Thompson', true, true),
('00000000-0000-0000-0000-000000000003', 5, 'Brilliant for the whole family!', 'Absolutely brilliant! Found out I share my birthday with some amazing celebrities. My kids love exploring the zodiac features too. Great family fun and educational at the same time!', 'United Kingdom', 'Emma Richardson', true, true),
('00000000-0000-0000-0000-000000000004', 5, 'Perfect for official documents', 'Finally, an age calculator that shows precise calculations! The precision is remarkable. I use it for official document purposes - very reliable and trustworthy.', 'India', 'Priya Sharma', true, true),
('00000000-0000-0000-0000-000000000005', 4, 'Clean design, works great on mobile', 'Clean design, works perfectly on mobile. The BMI calculator combined with life expectancy gives a complete health picture. Would recommend to anyone health-conscious.', 'Australia', 'Michael Roberts', true, true),
('00000000-0000-0000-0000-000000000006', 5, 'Perfect for tracking everything!', 'As someone who tracks everything, this app is perfect. The countdown to my next birthday and the detailed breakdowns make it genuinely useful, not just a gimmick. Love it!', 'United States', 'David Chen', true, true),
('00000000-0000-0000-0000-000000000007', 5, 'Beautiful zodiac and birthstone info', 'The birthstone and zodiac information is so beautifully presented! I''ve shared this site with all my friends. It''s become our go-to for birthday celebrations and gift ideas.', 'United Kingdom', 'Sophie Williams', true, true);