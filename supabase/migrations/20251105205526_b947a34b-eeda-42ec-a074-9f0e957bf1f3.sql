-- Add styles column to all row tables
ALTER TABLE page_rows ADD COLUMN IF NOT EXISTS styles JSONB DEFAULT '{}';
ALTER TABLE widget_rows ADD COLUMN IF NOT EXISTS styles JSONB DEFAULT '{}';
ALTER TABLE layout_rows ADD COLUMN IF NOT EXISTS styles JSONB DEFAULT '{}';

-- Add styles column to all component tables
ALTER TABLE page_components ADD COLUMN IF NOT EXISTS styles JSONB DEFAULT '{}';
ALTER TABLE widget_components ADD COLUMN IF NOT EXISTS styles JSONB DEFAULT '{}';
ALTER TABLE layout_components ADD COLUMN IF NOT EXISTS styles JSONB DEFAULT '{}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_rows_styles ON page_rows USING gin(styles);
CREATE INDEX IF NOT EXISTS idx_widget_rows_styles ON widget_rows USING gin(styles);
CREATE INDEX IF NOT EXISTS idx_layout_rows_styles ON layout_rows USING gin(styles);
CREATE INDEX IF NOT EXISTS idx_page_components_styles ON page_components USING gin(styles);
CREATE INDEX IF NOT EXISTS idx_widget_components_styles ON widget_components USING gin(styles);
CREATE INDEX IF NOT EXISTS idx_layout_components_styles ON layout_components USING gin(styles);