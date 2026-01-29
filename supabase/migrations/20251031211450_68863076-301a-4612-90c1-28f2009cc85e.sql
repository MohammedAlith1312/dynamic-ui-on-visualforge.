-- Create widgets table
CREATE TABLE public.widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create widget_rows table
CREATE TABLE public.widget_rows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  widget_id UUID NOT NULL REFERENCES public.widgets(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  columns INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create widget_components table
CREATE TABLE public.widget_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  widget_id UUID NOT NULL REFERENCES public.widgets(id) ON DELETE CASCADE,
  row_id UUID REFERENCES public.widget_rows(id) ON DELETE CASCADE,
  column_index INTEGER NOT NULL DEFAULT 0,
  component_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add widget tracking to page_components
ALTER TABLE public.page_components 
  ADD COLUMN widget_id UUID REFERENCES public.widgets(id) ON DELETE SET NULL,
  ADD COLUMN is_widget_instance BOOLEAN NOT NULL DEFAULT false;

-- Enable RLS on widgets
ALTER TABLE public.widgets ENABLE ROW LEVEL SECURITY;

-- Widgets policies
CREATE POLICY "Users can view own widgets"
  ON public.widgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view published widgets"
  ON public.widgets FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can insert own widgets"
  ON public.widgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own widgets"
  ON public.widgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own widgets"
  ON public.widgets FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on widget_rows
ALTER TABLE public.widget_rows ENABLE ROW LEVEL SECURITY;

-- Widget rows policies
CREATE POLICY "Users can view rows of own widgets"
  ON public.widget_rows FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.widgets
    WHERE widgets.id = widget_rows.widget_id
    AND widgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can view rows of published widgets"
  ON public.widget_rows FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.widgets
    WHERE widgets.id = widget_rows.widget_id
    AND widgets.is_published = true
  ));

CREATE POLICY "Users can insert rows to own widgets"
  ON public.widget_rows FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.widgets
    WHERE widgets.id = widget_rows.widget_id
    AND widgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update rows of own widgets"
  ON public.widget_rows FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.widgets
    WHERE widgets.id = widget_rows.widget_id
    AND widgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete rows of own widgets"
  ON public.widget_rows FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.widgets
    WHERE widgets.id = widget_rows.widget_id
    AND widgets.user_id = auth.uid()
  ));

-- Enable RLS on widget_components
ALTER TABLE public.widget_components ENABLE ROW LEVEL SECURITY;

-- Widget components policies
CREATE POLICY "Users can view components of own widgets"
  ON public.widget_components FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.widgets
    WHERE widgets.id = widget_components.widget_id
    AND widgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can view components of published widgets"
  ON public.widget_components FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.widgets
    WHERE widgets.id = widget_components.widget_id
    AND widgets.is_published = true
  ));

CREATE POLICY "Users can insert components to own widgets"
  ON public.widget_components FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.widgets
    WHERE widgets.id = widget_components.widget_id
    AND widgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update components of own widgets"
  ON public.widget_components FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.widgets
    WHERE widgets.id = widget_components.widget_id
    AND widgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete components of own widgets"
  ON public.widget_components FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.widgets
    WHERE widgets.id = widget_components.widget_id
    AND widgets.user_id = auth.uid()
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_widgets_updated_at
  BEFORE UPDATE ON public.widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_widget_rows_updated_at
  BEFORE UPDATE ON public.widget_rows
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_widget_components_updated_at
  BEFORE UPDATE ON public.widget_components
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();