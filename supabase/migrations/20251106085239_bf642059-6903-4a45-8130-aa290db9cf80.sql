-- Make entity_id nullable in query_conditions for groups
-- Groups don't need an entity_id, only leaf conditions do
ALTER TABLE query_conditions 
ALTER COLUMN entity_id DROP NOT NULL;

-- Similarly, make field_name and operator nullable since groups don't need them
ALTER TABLE query_conditions 
ALTER COLUMN field_name DROP NOT NULL;

ALTER TABLE query_conditions 
ALTER COLUMN operator DROP NOT NULL;