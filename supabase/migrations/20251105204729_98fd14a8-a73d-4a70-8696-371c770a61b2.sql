-- Create queries table (Missing in previous migrations)
CREATE TABLE IF NOT EXISTS queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    query_type TEXT NOT NULL,
    is_published BOOLEAN DEFAULT false,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create entities table (Just in case it is also missing, as queries and others rely on it)
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    is_published BOOLEAN DEFAULT false,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for new tables
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

-- Create basic policies (so you can use them immediately)
CREATE POLICY "Users can manage their own queries" ON queries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own entities" ON entities FOR ALL USING (auth.uid() = user_id);


-- Create query_conditions table (Missing in previous migrations)
CREATE TABLE IF NOT EXISTS query_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES entities(id),
    position INTEGER DEFAULT 0,
    field_name TEXT,
    operator TEXT,
    value TEXT,
    logic TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create query_joins table (Missing in previous migrations)
CREATE TABLE IF NOT EXISTS query_joins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    target_entity_id UUID REFERENCES entities(id),
    join_type TEXT,
    position INTEGER DEFAULT 0,
    primary_field TEXT,
    target_field TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Update query_conditions table to support tree structure
ALTER TABLE query_conditions
ADD COLUMN IF NOT EXISTS parent_condition_id uuid REFERENCES query_conditions(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_group boolean DEFAULT false;

-- Update query_joins table to support tree structure
ALTER TABLE query_joins
ADD COLUMN IF NOT EXISTS parent_join_id uuid REFERENCES query_joins(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_group boolean DEFAULT false;