-- Celebrity sitelinks table for ranked birthday matching
-- Data source: jeggers/celebrity-dates (Hugging Face, CC BY 4.0)
-- Sitelinks = number of Wikipedia language editions linking to this person
-- Higher sitelinks = more globally recognized

CREATE TABLE IF NOT EXISTS public.celebrity_sitelinks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date DATE,
  birth_month_day TEXT, -- MM-DD format e.g. "05-13" for fast birthday lookup
  death_date DATE,
  sitelinks INTEGER DEFAULT 0,
  nationality TEXT, -- ISO country name e.g. "United States", "India"
  nationality_code TEXT, -- ISO 2-letter code e.g. "US", "IN"
  occupation TEXT,
  wikidata_id TEXT,
  wikipedia_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast birthday lookup (primary use case)
CREATE INDEX IF NOT EXISTS idx_celebrity_sitelinks_birthday
  ON public.celebrity_sitelinks(birth_month_day);

-- Index for sorting by fame
CREATE INDEX IF NOT EXISTS idx_celebrity_sitelinks_sitelinks
  ON public.celebrity_sitelinks(sitelinks DESC);

-- Index for country filtering
CREATE INDEX IF NOT EXISTS idx_celebrity_sitelinks_nationality
  ON public.celebrity_sitelinks(nationality_code);

-- Composite index for the main query pattern: birthday + country + sitelinks
CREATE INDEX IF NOT EXISTS idx_celebrity_sitelinks_main
  ON public.celebrity_sitelinks(birth_month_day, nationality_code, sitelinks DESC);

-- RLS: public read, no write from client
ALTER TABLE public.celebrity_sitelinks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read celebrity_sitelinks"
  ON public.celebrity_sitelinks
  FOR SELECT
  TO public
  USING (true);
