-- Fix Supabase auth warnings
-- 1. Set OTP expiry to recommended threshold (shorter expiry time)
UPDATE auth.config 
SET value = '300' -- 5 minutes instead of default 1 hour
WHERE parameter = 'otp_expiry';

-- 2. Enable leaked password protection
UPDATE auth.config 
SET value = 'true'
WHERE parameter = 'password_leaked_verification_enabled';

-- Create content_tracking table for user progress tracking
CREATE TABLE public.content_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_url TEXT NOT NULL,
  content_type TEXT NOT NULL,
  topic TEXT NOT NULL,
  watch_time INTEGER DEFAULT 0, -- in seconds
  total_duration INTEGER DEFAULT 0, -- in seconds
  completion_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_url)
);

-- Enable RLS on content_tracking
ALTER TABLE public.content_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for content_tracking
CREATE POLICY "Users can manage their own content tracking" 
ON public.content_tracking 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_content_tracking_updated_at
BEFORE UPDATE ON public.content_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;