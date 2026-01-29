-- Create enum for field types
CREATE TYPE public.entity_field_type AS ENUM ('text', 'number', 'boolean', 'date', 'longtext', 'image', 'url');

-- Entity definitions table
CREATE TABLE public.entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Entity fields table
CREATE TABLE public.entity_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  field_type entity_field_type NOT NULL,
  is_required BOOLEAN DEFAULT false,
  default_value TEXT,
  validation_rules JSONB DEFAULT '{}',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entity_id, name)
);

-- Entity records table
CREATE TABLE public.entity_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_entity_records_entity_id ON entity_records(entity_id);
CREATE INDEX idx_entity_records_data ON entity_records USING GIN(data);
CREATE INDEX idx_entity_fields_entity_id ON entity_fields(entity_id);
CREATE INDEX idx_entity_fields_position ON entity_fields(entity_id, position);

-- Enable RLS on entities
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entities"
  ON public.entities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entities"
  ON public.entities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entities"
  ON public.entities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entities"
  ON public.entities FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on entity_fields
ALTER TABLE public.entity_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view fields of own entities"
  ON public.entity_fields FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM entities 
    WHERE entities.id = entity_fields.entity_id 
    AND entities.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert fields to own entities"
  ON public.entity_fields FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM entities 
    WHERE entities.id = entity_fields.entity_id 
    AND entities.user_id = auth.uid()
  ));

CREATE POLICY "Users can update fields of own entities"
  ON public.entity_fields FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM entities 
    WHERE entities.id = entity_fields.entity_id 
    AND entities.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete fields of own entities"
  ON public.entity_fields FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM entities 
    WHERE entities.id = entity_fields.entity_id 
    AND entities.user_id = auth.uid()
  ));

-- Enable RLS on entity_records
ALTER TABLE public.entity_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own records"
  ON public.entity_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view published records of published entities"
  ON public.entity_records FOR SELECT
  USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM entities 
      WHERE entities.id = entity_records.entity_id 
      AND entities.is_published = true
    )
  );

CREATE POLICY "Users can insert own records"
  ON public.entity_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records"
  ON public.entity_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records"
  ON public.entity_records FOR DELETE
  USING (auth.uid() = user_id);

-- Function to validate entity record data
CREATE OR REPLACE FUNCTION public.validate_entity_record()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  field_def RECORD;
  field_value TEXT;
BEGIN
  FOR field_def IN 
    SELECT name, is_required, field_type 
    FROM entity_fields 
    WHERE entity_id = NEW.entity_id AND is_required = true
  LOOP
    field_value := NEW.data ->> field_def.name;
    
    IF field_value IS NULL OR field_value = '' THEN
      RAISE EXCEPTION 'Required field % is missing', field_def.name;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger for entity record validation
CREATE TRIGGER validate_entity_record_trigger
  BEFORE INSERT OR UPDATE ON entity_records
  FOR EACH ROW
  EXECUTE FUNCTION validate_entity_record();

-- Trigger to update updated_at on entities
CREATE TRIGGER update_entities_updated_at
  BEFORE UPDATE ON entities
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Trigger to update updated_at on entity_records
CREATE TRIGGER update_entity_records_updated_at
  BEFORE UPDATE ON entity_records
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();