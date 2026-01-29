-- Create table for join field conditions
CREATE TABLE IF NOT EXISTS public.query_join_conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  join_id UUID NOT NULL REFERENCES public.query_joins(id) ON DELETE CASCADE,
  primary_field TEXT NOT NULL,
  target_field TEXT NOT NULL,
  logic TEXT DEFAULT 'and' CHECK (logic IN ('and', 'or')),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.query_join_conditions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage join conditions of own queries"
ON public.query_join_conditions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM query_joins
    JOIN queries ON queries.id = query_joins.query_id
    WHERE query_joins.id = query_join_conditions.join_id
    AND queries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view join conditions of published queries"
ON public.query_join_conditions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM query_joins
    JOIN queries ON queries.id = query_joins.query_id
    WHERE query_joins.id = query_join_conditions.join_id
    AND queries.is_published = true
  )
);

-- Migrate existing join conditions
INSERT INTO public.query_join_conditions (join_id, primary_field, target_field, position)
SELECT id, primary_field, target_field, 0
FROM public.query_joins
WHERE is_group = false 
  AND primary_field IS NOT NULL 
  AND target_field IS NOT NULL
  AND primary_field != ''
  AND target_field != '';

-- Drop old columns (we'll keep them for now as fallback)
-- ALTER TABLE public.query_joins DROP COLUMN primary_field;
-- ALTER TABLE public.query_joins DROP COLUMN target_field;