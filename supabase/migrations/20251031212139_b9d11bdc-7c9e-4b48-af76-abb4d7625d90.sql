-- Create layouts table
CREATE TABLE public.layouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create layout_rows table
CREATE TABLE public.layout_rows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  layout_id UUID NOT NULL REFERENCES public.layouts(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  columns INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create layout_components table
CREATE TABLE public.layout_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  layout_id UUID NOT NULL REFERENCES public.layouts(id) ON DELETE CASCADE,
  row_id UUID REFERENCES public.layout_rows(id) ON DELETE CASCADE,
  column_index INTEGER NOT NULL DEFAULT 0,
  component_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add layout reference to pages
ALTER TABLE public.pages 
  ADD COLUMN layout_id UUID REFERENCES public.layouts(id) ON DELETE SET NULL;

-- Enable RLS on layouts
ALTER TABLE public.layouts ENABLE ROW LEVEL SECURITY;

-- Layouts policies
CREATE POLICY "Users can view own layouts"
  ON public.layouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view published layouts"
  ON public.layouts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can insert own layouts"
  ON public.layouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own layouts"
  ON public.layouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own layouts"
  ON public.layouts FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on layout_rows
ALTER TABLE public.layout_rows ENABLE ROW LEVEL SECURITY;

-- Layout rows policies
CREATE POLICY "Users can view rows of own layouts"
  ON public.layout_rows FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.layouts
    WHERE layouts.id = layout_rows.layout_id
    AND layouts.user_id = auth.uid()
  ));

CREATE POLICY "Users can view rows of published layouts"
  ON public.layout_rows FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.layouts
    WHERE layouts.id = layout_rows.layout_id
    AND layouts.is_published = true
  ));

CREATE POLICY "Users can insert rows to own layouts"
  ON public.layout_rows FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.layouts
    WHERE layouts.id = layout_rows.layout_id
    AND layouts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update rows of own layouts"
  ON public.layout_rows FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.layouts
    WHERE layouts.id = layout_rows.layout_id
    AND layouts.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete rows of own layouts"
  ON public.layout_rows FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.layouts
    WHERE layouts.id = layout_rows.layout_id
    AND layouts.user_id = auth.uid()
  ));

-- Enable RLS on layout_components
ALTER TABLE public.layout_components ENABLE ROW LEVEL SECURITY;

-- Layout components policies
CREATE POLICY "Users can view components of own layouts"
  ON public.layout_components FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.layouts
    WHERE layouts.id = layout_components.layout_id
    AND layouts.user_id = auth.uid()
  ));

CREATE POLICY "Users can view components of published layouts"
  ON public.layout_components FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.layouts
    WHERE layouts.id = layout_components.layout_id
    AND layouts.is_published = true
  ));

CREATE POLICY "Users can insert components to own layouts"
  ON public.layout_components FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.layouts
    WHERE layouts.id = layout_components.layout_id
    AND layouts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update components of own layouts"
  ON public.layout_components FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.layouts
    WHERE layouts.id = layout_components.layout_id
    AND layouts.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete components of own layouts"
  ON public.layout_components FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.layouts
    WHERE layouts.id = layout_components.layout_id
    AND layouts.user_id = auth.uid()
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_layouts_updated_at
  BEFORE UPDATE ON public.layouts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_layout_rows_updated_at
  BEFORE UPDATE ON public.layout_rows
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_layout_components_updated_at
  BEFORE UPDATE ON public.layout_components
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();