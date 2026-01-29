-- Add column_widths and responsive_config to row tables
ALTER TABLE page_rows 
ADD COLUMN column_widths JSONB DEFAULT '[]',
ADD COLUMN responsive_config JSONB DEFAULT '{"desktop": {}, "tablet": {}, "mobile": {}}'::jsonb;

ALTER TABLE widget_rows 
ADD COLUMN column_widths JSONB DEFAULT '[]',
ADD COLUMN responsive_config JSONB DEFAULT '{"desktop": {}, "tablet": {}, "mobile": {}}'::jsonb;

ALTER TABLE layout_rows 
ADD COLUMN column_widths JSONB DEFAULT '[]',
ADD COLUMN responsive_config JSONB DEFAULT '{"desktop": {}, "tablet": {}, "mobile": {}}'::jsonb;

-- Create section_templates table
CREATE TABLE section_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE section_templates ENABLE ROW LEVEL SECURITY;

-- Everyone can view public templates
CREATE POLICY "Everyone can view public templates"
ON section_templates FOR SELECT
USING (is_public = true);

-- Users can manage own templates
CREATE POLICY "Users can manage own templates"
ON section_templates FOR ALL
USING (auth.uid() = created_by);

-- Insert default section templates
INSERT INTO section_templates (name, description, category, template_data, is_public) VALUES
(
  'Hero with CTA',
  'Full-width hero section with heading, description, and call-to-action button',
  'hero',
  '{
    "rows": [{
      "columns": 1,
      "column_widths": [100],
      "styles": {
        "backgroundColor": "hsl(var(--primary))",
        "paddingTop": "80px",
        "paddingBottom": "80px"
      },
      "components": [{
        "component_type": "heading",
        "column_index": 0,
        "position": 0,
        "content": {"text": "Build Amazing Products Faster", "level": "h1"},
        "styles": {"textAlign": "center", "color": "hsl(var(--primary-foreground))"}
      }, {
        "component_type": "text",
        "column_index": 0,
        "position": 1,
        "content": {"text": "Create beautiful pages with our drag-and-drop editor. No coding required."},
        "styles": {"textAlign": "center", "fontSize": "18px", "color": "hsl(var(--primary-foreground))"}
      }, {
        "component_type": "button",
        "column_index": 0,
        "position": 2,
        "content": {"text": "Get Started", "variant": "secondary"},
        "styles": {"textAlign": "center", "marginTop": "24px"}
      }]
    }]
  }'::jsonb,
  true
),
(
  'Hero with Image',
  'Two-column hero section with content on left and image on right',
  'hero',
  '{
    "rows": [{
      "columns": 2,
      "column_widths": [50, 50],
      "styles": {
        "paddingTop": "60px",
        "paddingBottom": "60px"
      },
      "components": [{
        "component_type": "heading",
        "column_index": 0,
        "position": 0,
        "content": {"text": "Welcome to Our Platform", "level": "h1"}
      }, {
        "component_type": "text",
        "column_index": 0,
        "position": 1,
        "content": {"text": "Discover powerful features that help you build faster and better."}
      }, {
        "component_type": "button",
        "column_index": 0,
        "position": 2,
        "content": {"text": "Learn More", "variant": "default"}
      }, {
        "component_type": "image",
        "column_index": 1,
        "position": 0,
        "content": {"url": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d", "alt": "Hero image"}
      }]
    }]
  }'::jsonb,
  true
),
(
  'Pricing - 3 Tiers',
  'Three-column pricing section with plans',
  'pricing',
  '{
    "rows": [{
      "columns": 3,
      "column_widths": [33.33, 33.33, 33.33],
      "styles": {
        "paddingTop": "60px",
        "paddingBottom": "60px"
      },
      "components": [{
        "component_type": "heading",
        "column_index": 0,
        "position": 0,
        "content": {"text": "Starter", "level": "h3"},
        "styles": {"textAlign": "center"}
      }, {
        "component_type": "text",
        "column_index": 0,
        "position": 1,
        "content": {"text": "$29/month"},
        "styles": {"textAlign": "center", "fontSize": "24px", "fontWeight": "bold"}
      }, {
        "component_type": "button",
        "column_index": 0,
        "position": 2,
        "content": {"text": "Choose Plan", "variant": "outline"},
        "styles": {"textAlign": "center"}
      }, {
        "component_type": "heading",
        "column_index": 1,
        "position": 0,
        "content": {"text": "Professional", "level": "h3"},
        "styles": {"textAlign": "center"}
      }, {
        "component_type": "text",
        "column_index": 1,
        "position": 1,
        "content": {"text": "$99/month"},
        "styles": {"textAlign": "center", "fontSize": "24px", "fontWeight": "bold"}
      }, {
        "component_type": "button",
        "column_index": 1,
        "position": 2,
        "content": {"text": "Choose Plan", "variant": "default"},
        "styles": {"textAlign": "center"}
      }, {
        "component_type": "heading",
        "column_index": 2,
        "position": 0,
        "content": {"text": "Enterprise", "level": "h3"},
        "styles": {"textAlign": "center"}
      }, {
        "component_type": "text",
        "column_index": 2,
        "position": 1,
        "content": {"text": "Custom"},
        "styles": {"textAlign": "center", "fontSize": "24px", "fontWeight": "bold"}
      }, {
        "component_type": "button",
        "column_index": 2,
        "position": 2,
        "content": {"text": "Contact Us", "variant": "outline"},
        "styles": {"textAlign": "center"}
      }]
    }]
  }'::jsonb,
  true
),
(
  'Testimonials - 3 Column',
  'Three testimonial cards with quotes',
  'testimonials',
  '{
    "rows": [{
      "columns": 3,
      "column_widths": [33.33, 33.33, 33.33],
      "styles": {
        "paddingTop": "60px",
        "paddingBottom": "60px",
        "backgroundColor": "hsl(var(--muted))"
      },
      "components": [{
        "component_type": "quote",
        "column_index": 0,
        "position": 0,
        "content": {"text": "This product changed the way we work. Highly recommended!", "author": "Sarah Johnson", "role": "CEO, TechCorp"}
      }, {
        "component_type": "quote",
        "column_index": 1,
        "position": 0,
        "content": {"text": "Amazing features and excellent support. Worth every penny.", "author": "Michael Chen", "role": "Product Manager"}
      }, {
        "component_type": "quote",
        "column_index": 2,
        "position": 0,
        "content": {"text": "The best tool in its category. Our team loves it.", "author": "Emily Rodriguez", "role": "Design Lead"}
      }]
    }]
  }'::jsonb,
  true
),
(
  'Feature Grid - 3 Column',
  'Three-column feature section with icons and descriptions',
  'features',
  '{
    "rows": [{
      "columns": 3,
      "column_widths": [33.33, 33.33, 33.33],
      "styles": {
        "paddingTop": "60px",
        "paddingBottom": "60px"
      },
      "components": [{
        "component_type": "heading",
        "column_index": 0,
        "position": 0,
        "content": {"text": "Fast & Reliable", "level": "h3"},
        "styles": {"textAlign": "center"}
      }, {
        "component_type": "text",
        "column_index": 0,
        "position": 1,
        "content": {"text": "Built for speed and performance with 99.9% uptime guarantee."},
        "styles": {"textAlign": "center"}
      }, {
        "component_type": "heading",
        "column_index": 1,
        "position": 0,
        "content": {"text": "Easy to Use", "level": "h3"},
        "styles": {"textAlign": "center"}
      }, {
        "component_type": "text",
        "column_index": 1,
        "position": 1,
        "content": {"text": "Intuitive interface that anyone can master in minutes."},
        "styles": {"textAlign": "center"}
      }, {
        "component_type": "heading",
        "column_index": 2,
        "position": 0,
        "content": {"text": "Secure & Private", "level": "h3"},
        "styles": {"textAlign": "center"}
      }, {
        "component_type": "text",
        "column_index": 2,
        "position": 1,
        "content": {"text": "Enterprise-grade security with end-to-end encryption."},
        "styles": {"textAlign": "center"}
      }]
    }]
  }'::jsonb,
  true
);