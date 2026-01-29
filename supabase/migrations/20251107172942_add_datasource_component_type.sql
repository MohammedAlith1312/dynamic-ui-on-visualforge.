-- Add 'datasource' to allowed component types
ALTER TABLE page_components DROP CONSTRAINT IF EXISTS page_components_component_type_check;
ALTER TABLE page_components ADD CONSTRAINT page_components_component_type_check 
  CHECK (component_type IN ('heading', 'paragraph', 'image', 'button', 'link', 'video', 'divider', 'spacer', 'quote', 'list', 'code', 'page-content', 'entity-list', 'entity-detail', 'query', 'chart', 'tabs', 'accordion', 'card', 'form-input', 'form-textarea', 'form-select', 'form-checkbox', 'form-submit', 'datasource'));

ALTER TABLE widget_components DROP CONSTRAINT IF EXISTS widget_components_component_type_check;
ALTER TABLE widget_components ADD CONSTRAINT widget_components_component_type_check 
  CHECK (component_type IN ('heading', 'paragraph', 'image', 'button', 'link', 'video', 'divider', 'spacer', 'quote', 'list', 'code', 'entity-list', 'entity-detail', 'query', 'chart', 'tabs', 'accordion', 'card', 'form-input', 'form-textarea', 'form-select', 'form-checkbox', 'form-submit', 'datasource'));

ALTER TABLE layout_components DROP CONSTRAINT IF EXISTS layout_components_component_type_check;
ALTER TABLE layout_components ADD CONSTRAINT layout_components_component_type_check 
  CHECK (component_type IN ('heading', 'paragraph', 'image', 'button', 'link', 'video', 'divider', 'spacer', 'quote', 'list', 'code', 'page-content', 'query', 'chart', 'tabs', 'accordion', 'card', 'form-input', 'form-textarea', 'form-select', 'form-checkbox', 'form-submit', 'datasource'));

