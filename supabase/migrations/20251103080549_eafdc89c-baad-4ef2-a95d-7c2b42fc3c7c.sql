-- Create entity_views table to store saved views
CREATE TABLE public.entity_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  view_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.entity_views ENABLE ROW LEVEL SECURITY;

-- Create policies for entity_views
CREATE POLICY "Users can view own entity views"
ON public.entity_views
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own entity views"
ON public.entity_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entity views"
ON public.entity_views
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entity views"
ON public.entity_views
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_entity_views_updated_at
BEFORE UPDATE ON public.entity_views
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();