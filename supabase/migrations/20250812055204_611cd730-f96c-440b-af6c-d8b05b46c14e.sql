-- Create table to store per-user search summaries with total content duration
CREATE TABLE public.user_search_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  learning_level TEXT NOT NULL DEFAULT 'beginner',
  items_count INTEGER NOT NULL DEFAULT 0,
  total_content_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint to allow upserts per user/topic/level
CREATE UNIQUE INDEX user_search_summaries_unique
  ON public.user_search_summaries (user_id, query, learning_level);

-- Enable Row Level Security
ALTER TABLE public.user_search_summaries ENABLE ROW LEVEL SECURITY;

-- Policies: user can manage their own summaries
CREATE POLICY "Users can view their own search summaries"
ON public.user_search_summaries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search summaries"
ON public.user_search_summaries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search summaries"
ON public.user_search_summaries
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search summaries"
ON public.user_search_summaries
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_user_search_summaries_updated_at
BEFORE UPDATE ON public.user_search_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();