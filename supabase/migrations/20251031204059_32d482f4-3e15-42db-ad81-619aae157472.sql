-- Create page_rows table for grid layout
CREATE TABLE public.page_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  columns INTEGER NOT NULL DEFAULT 1 CHECK (columns >= 1 AND columns <= 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_rows ENABLE ROW LEVEL SECURITY;

-- Policies for page_rows
CREATE POLICY "Users can view rows of own pages"
  ON public.page_rows FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_rows.page_id
      AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view rows of published pages"
  ON public.page_rows FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_rows.page_id
      AND pages.is_published = true
    )
  );

CREATE POLICY "Users can insert rows to own pages"
  ON public.page_rows FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_rows.page_id
      AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rows of own pages"
  ON public.page_rows FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_rows.page_id
      AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete rows of own pages"
  ON public.page_rows FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_rows.page_id
      AND pages.user_id = auth.uid()
    )
  );

-- Add column_index and row_id to page_components
ALTER TABLE public.page_components 
ADD COLUMN row_id UUID REFERENCES public.page_rows(id) ON DELETE CASCADE,
ADD COLUMN column_index INTEGER NOT NULL DEFAULT 0;

-- Create trigger for page_rows updated_at
CREATE TRIGGER update_page_rows_updated_at
  BEFORE UPDATE ON public.page_rows
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();