-- Migration to add published_html column to pages table
-- This column will store the rendered HTML content when a page is published

ALTER TABLE IF EXISTS pages 
ADD COLUMN IF NOT EXISTS published_html text;

-- Add a comment to the column for better documentation
COMMENT ON COLUMN pages.published_html IS 'Stores the rendered HTML content generated during the last publish action.';
