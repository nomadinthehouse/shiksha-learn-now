
-- Create table for caching search results
CREATE TABLE public.search_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'blog', 'website')),
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

-- Create index for faster lookups
CREATE INDEX idx_search_cache_query_type ON public.search_cache(query, content_type);
CREATE INDEX idx_search_cache_expires ON public.search_cache(expires_at);

-- Create table for storing individual content items
CREATE TABLE public.content_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'blog', 'website')),
  summary TEXT,
  thumbnail_url TEXT,
  author TEXT,
  duration TEXT,
  publish_date TIMESTAMP WITH TIME ZONE,
  source TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for content lookups
CREATE INDEX idx_content_items_url ON public.content_items(url);
CREATE INDEX idx_content_items_type ON public.content_items(content_type);

-- Enable RLS (Row Level Security)
ALTER TABLE public.search_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is educational content)
CREATE POLICY "Allow public read access to search cache" 
  ON public.search_cache FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert to search cache" 
  ON public.search_cache FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public read access to content items" 
  ON public.content_items FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert to content items" 
  ON public.content_items FOR INSERT 
  WITH CHECK (true);

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.search_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;
