-- Update existing 'text' components to 'paragraph'
UPDATE public.page_components 
SET component_type = 'paragraph' 
WHERE component_type = 'text';

-- Add new constraint with expanded component types
ALTER TABLE public.page_components 
ADD CONSTRAINT page_components_component_type_check 
CHECK (component_type IN (
  'heading',
  'paragraph', 
  'image',
  'button',
  'link',
  'video',
  'divider',
  'spacer',
  'quote',
  'list',
  'code'
));

-- Fix the security warning by setting search_path on handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;