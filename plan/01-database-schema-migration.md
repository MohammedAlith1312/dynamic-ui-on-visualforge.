# Database Schema Migration Plan

## Overview

This document outlines the unified database schema design using a **single table approach** where each object (page, widget, layout, form, etc.) is stored as a complete document with all its children (rows, components) nested within a JSON field. This approach maximizes simplicity and ensures atomic operations.

## Current Schema Analysis

### Existing Tables to Consolidate

**Component Tables:**
- `page_components` - Components within pages
- `widget_components` - Components within widgets
- `layout_components` - Components within layouts

**Entity Tables:**
- `pages` - Page definitions
- `widgets` - Widget definitions
- `layouts` - Layout definitions
- `forms` - Form definitions (planned)
- `queries` - Query definitions (planned)
- `api_collections` - API collection definitions (planned)

**Related Tables:**
- `page_rows`, `widget_rows`, `layout_rows` - Row structures
- `entity_records` - Entity data records
- `entity_fields` - Entity field definitions

## Unified Single-Object Schema Design

### Single Components/Objects Table

All objects (pages, widgets, layouts, forms, queries, etc.) are stored in a single `components` table. Each row represents a complete object with all its nested data stored in the `data` JSON field.

#### Schema Definition

**PostgreSQL:**
```sql
CREATE TABLE components (
  id VARCHAR(36) PRIMARY KEY,
  component_type VARCHAR(50) NOT NULL,  -- 'page', 'widget', 'layout', 'form', 'query', 'api_collection', etc.
  name VARCHAR(255) NOT NULL,            -- Internal identifier (e.g., 'home-page')
  slug VARCHAR(255) UNIQUE,             -- URL-friendly identifier
  user_id VARCHAR(36) NOT NULL,          -- References users.id
  title VARCHAR(255) NOT NULL,           -- Display title
  description TEXT,
  data JSONB NOT NULL DEFAULT '{}',      -- Complete object data including rows and nested components
  is_published BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',           -- Additional metadata (tags, categories, etc.)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_component_type_user (component_type, user_id),
  INDEX idx_slug (slug),
  INDEX idx_published (is_published, component_type),
  INDEX idx_user (user_id),
  INDEX idx_data_gin (data) USING GIN,   -- For JSON queries
  INDEX idx_name (name)
);

-- Unique constraint for user + component_type + name
CREATE UNIQUE INDEX idx_user_component_name ON components(user_id, component_type, name);

-- Updated_at trigger
CREATE TRIGGER update_components_updated_at
  BEFORE UPDATE ON components
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Constraint for valid component types
ALTER TABLE components 
ADD CONSTRAINT chk_component_type 
CHECK (component_type IN ('page', 'widget', 'layout', 'form', 'query', 'api_collection', 'entity', 'template'));
```

**MySQL:**
```sql
CREATE TABLE components (
  id VARCHAR(36) PRIMARY KEY,
  component_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  data JSON NOT NULL DEFAULT (JSON_OBJECT()),
  is_published BOOLEAN NOT NULL DEFAULT false,
  metadata JSON DEFAULT (JSON_OBJECT()),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_component_type_user (component_type, user_id),
  INDEX idx_slug (slug),
  INDEX idx_published (is_published, component_type),
  INDEX idx_user (user_id),
  INDEX idx_name (name),
  UNIQUE KEY idx_user_component_name (user_id, component_type, name),
  CONSTRAINT chk_component_type CHECK (component_type IN ('page', 'widget', 'layout', 'form', 'query', 'api_collection', 'entity', 'template'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**SQLite:**
```sql
CREATE TABLE components (
  id TEXT PRIMARY KEY,
  component_type TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  data TEXT NOT NULL DEFAULT '{}',  -- JSON stored as TEXT
  is_published INTEGER NOT NULL DEFAULT 0,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_component_type_user ON components(component_type, user_id);
CREATE INDEX idx_slug ON components(slug);
CREATE INDEX idx_published ON components(is_published, component_type);
CREATE INDEX idx_user ON components(user_id);
CREATE INDEX idx_name ON components(name);
CREATE UNIQUE INDEX idx_user_component_name ON components(user_id, component_type, name);
```

## Complete Object Data Structure

The `data` JSONB/JSON column contains the **entire object structure** including all rows and nested components. Here are examples for different component types:

### Page Object Structure

```json
{
  "meta": {
    "menuOrder": 0,
    "layoutId": null,
    "seo": {
      "title": "Home Page",
      "description": "Welcome to our website",
      "keywords": ["home", "welcome"]
    }
  },
  "rows": [
    {
      "id": "row-1",
      "position": 0,
      "columns": 2,
      "columnWidths": [50, 50],
      "styles": {
        "backgroundColor": "#ffffff",
        "padding": {
          "top": "2rem",
          "bottom": "2rem",
          "left": "1rem",
          "right": "1rem"
        }
      },
      "responsiveConfig": {
        "mobile": {
          "columns": 1,
          "columnWidths": [100]
        },
        "tablet": {
          "columns": 2,
          "columnWidths": [50, 50]
        }
      },
      "components": [
        {
          "id": "comp-1",
          "componentType": "heading",
          "position": 0,
          "columnIndex": 0,
          "data": {
            "content": {
              "text": "Welcome to Our Site",
              "level": 1,
              "alignment": "center"
            },
            "styles": {
              "color": "#000000",
              "fontSize": "2.5rem",
              "fontWeight": "bold",
              "margin": {
                "bottom": "1rem"
              }
            },
            "config": {
              "responsive": {
                "mobile": {
                  "fontSize": "1.5rem"
                }
              }
            }
          }
        },
        {
          "id": "comp-2",
          "componentType": "paragraph",
          "position": 1,
          "columnIndex": 1,
          "data": {
            "content": {
              "text": "This is a paragraph of text that describes our services."
            },
            "styles": {
              "color": "#666666",
              "fontSize": "1rem",
              "lineHeight": "1.6"
            }
          }
        }
      ]
    },
    {
      "id": "row-2",
      "position": 1,
      "columns": 1,
      "columnWidths": [100],
      "styles": {},
      "components": [
        {
          "id": "comp-3",
          "componentType": "image",
          "position": 0,
          "columnIndex": 0,
          "data": {
            "content": {
              "url": "https://example.com/hero-image.jpg",
              "alt": "Hero image",
              "width": 1200,
              "height": 600
            },
            "styles": {
              "borderRadius": "8px",
              "boxShadow": "0 4px 6px rgba(0,0,0,0.1)"
            }
          }
        }
      ]
    }
  ]
}
```

### Widget Object Structure

```json
{
  "meta": {
    "category": "navigation",
    "reusable": true,
    "description": "Main navigation widget"
  },
  "rows": [
    {
      "id": "row-1",
      "position": 0,
      "columns": 1,
      "columnWidths": [100],
      "components": [
        {
          "id": "comp-1",
          "componentType": "navigation",
          "position": 0,
          "columnIndex": 0,
          "data": {
            "content": {
              "items": [
                { "label": "Home", "url": "/" },
                { "label": "About", "url": "/about" },
                { "label": "Contact", "url": "/contact" }
              ]
            },
            "styles": {
              "backgroundColor": "#f8f9fa",
              "padding": "1rem"
            }
          }
        }
      ]
    }
  ]
}
```

### Form Object Structure

```json
{
  "meta": {
    "submitButtonText": "Submit",
    "successMessage": "Thank you for your submission!",
    "redirectUrl": null,
    "allowMultipleSubmissions": true,
    "requireAuthentication": false
  },
  "sections": [
    {
      "id": "section-1",
      "name": "Personal Information",
      "position": 0,
      "sectionType": "section",
      "fields": [
        {
          "id": "field-1",
          "fieldName": "full_name",
          "label": "Full Name",
          "fieldType": "text",
          "isRequired": true,
          "position": 0,
          "data": {
            "placeholder": "Enter your full name",
            "validation": {
              "minLength": 2,
              "maxLength": 100
            }
          }
        },
        {
          "id": "field-2",
          "fieldName": "email",
          "label": "Email",
          "fieldType": "email",
          "isRequired": true,
          "position": 1,
          "data": {
            "placeholder": "Enter your email",
            "validation": {
              "pattern": "^[^@]+@[^@]+\\.[^@]+$"
            }
          }
        }
      ]
    }
  ]
}
```

### Query Object Structure

```json
{
  "meta": {
    "queryType": "flat",
    "primaryEntityId": "entity-uuid"
  },
  "joins": [
    {
      "id": "join-1",
      "targetEntityId": "entity-uuid-2",
      "joinType": "inner",
      "primaryField": "user_id",
      "targetField": "id"
    }
  ],
  "fields": [
    {
      "entityId": "entity-uuid",
      "fieldName": "title",
      "aggregation": null
    },
    {
      "entityId": "entity-uuid-2",
      "fieldName": "name",
      "aggregation": null
    }
  ],
  "conditions": [
    {
      "entityId": "entity-uuid",
      "fieldName": "is_published",
      "operator": "equals",
      "value": "true"
    }
  ],
  "settings": {
    "groupBy": [],
    "sortEntityId": "entity-uuid",
    "sortField": "created_at",
    "sortOrder": "desc",
    "limitRows": 50,
    "displayStyle": "table"
  }
}
```

## Component Type Values

The `component_type` field can have the following values:

- `page` - Web pages
- `widget` - Reusable widget components
- `layout` - Layout templates
- `form` - Form definitions
- `query` - Database query definitions
- `api_collection` - API collection definitions
- `entity` - Dynamic entity definitions
- `template` - Template definitions

## Supporting Tables

### Users Table

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  profile JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email)
);
```

### Files Table

```sql
CREATE TABLE files (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT,
  mime_type VARCHAR(100),
  storage_provider VARCHAR(50) DEFAULT 'local',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user (user_id),
  INDEX idx_file_type (file_type)
);
```

### Component Versions Table

For version history:

```sql
CREATE TABLE component_versions (
  id VARCHAR(36) PRIMARY KEY,
  component_id VARCHAR(36) NOT NULL,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,  -- Full snapshot of component data
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  
  INDEX idx_component_versions (component_id, version_number)
);
```

### Entity Records Table

For dynamic entity data (separate from component definitions):

```sql
CREATE TABLE entity_records (
  id VARCHAR(36) PRIMARY KEY,
  entity_id VARCHAR(36) NOT NULL,  -- References components.id where component_type = 'entity'
  user_id VARCHAR(36) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_entity (entity_id),
  INDEX idx_user (user_id),
  INDEX idx_data_gin (data) USING GIN
);
```

### Entity Fields Table

Field definitions for entity components:

```sql
CREATE TABLE entity_fields (
  id VARCHAR(36) PRIMARY KEY,
  entity_id VARCHAR(36) NOT NULL,  -- References components.id where component_type = 'entity'
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT false,
  default_value TEXT,
  validation_rules JSONB DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_entity (entity_id),
  UNIQUE KEY idx_entity_name (entity_id, name)
);
```

## Migration Strategy

### Phase 1: Schema Creation

1. Create the unified `components` table
2. Create supporting tables (users, files, etc.)
3. Create all indexes
4. Set up triggers for `updated_at` fields

### Phase 2: Data Migration

#### Page Migration Example

```javascript
async function migratePage(page) {
  // Fetch all related data from old schema
  const rows = await supabase
    .from('page_rows')
    .select('*')
    .eq('page_id', page.id)
    .order('position');
  
  const components = await supabase
    .from('page_components')
    .select('*')
    .eq('page_id', page.id);
  
  // Build nested structure
  const rowsWithComponents = rows.map(row => {
    const rowComponents = components
      .filter(c => c.row_id === row.id)
      .map(comp => ({
        id: comp.id,
        componentType: comp.component_type,
        position: comp.position,
        columnIndex: comp.column_index || 0,
        data: {
          content: comp.content || {},
          styles: comp.styles || {},
          config: {},
          widgetId: comp.widget_id || null,
          isWidgetInstance: comp.is_widget_instance || false
        }
      }))
      .sort((a, b) => a.position - b.position);
    
    return {
      id: row.id,
      position: row.position,
      columns: row.columns,
      columnWidths: row.column_widths || null,
      styles: row.styles || {},
      responsiveConfig: row.responsive_config || {},
      components: rowComponents
    };
  });
  
  // Create complete object
  const componentData = {
    meta: {
      menuOrder: page.menu_order || 0,
      layoutId: page.layout_id || null,
      seo: page.seo || {}
    },
    rows: rowsWithComponents
  };
  
  // Insert into new schema
  await db.insert('components', {
    id: page.id,
    component_type: 'page',
    name: page.slug,
    slug: page.slug,
    user_id: page.user_id,
    title: page.title,
    description: null,
    data: JSON.stringify(componentData),
    is_published: page.is_published || false,
    metadata: JSON.stringify({}),
    created_at: page.created_at,
    updated_at: page.updated_at
  });
}
```

#### Widget Migration Example

```javascript
async function migrateWidget(widget) {
  const rows = await getWidgetRows(widget.id);
  const components = await getWidgetComponents(widget.id);
  
  const rowsWithComponents = rows.map(row => ({
    id: row.id,
    position: row.position,
    columns: row.columns,
    columnWidths: row.column_widths,
    styles: row.styles || {},
    components: components
      .filter(c => c.row_id === row.id)
      .map(comp => ({
        id: comp.id,
        componentType: comp.component_type,
        position: comp.position,
        columnIndex: comp.column_index || 0,
        data: {
          content: comp.content || {},
          styles: comp.styles || {},
          config: {}
        }
      }))
  }));
  
  await db.insert('components', {
    id: widget.id,
    component_type: 'widget',
    name: widget.title.toLowerCase().replace(/\s+/g, '-'),
    slug: widget.title.toLowerCase().replace(/\s+/g, '-'),
    user_id: widget.user_id,
    title: widget.title,
    data: JSON.stringify({
      meta: {
        category: widget.category,
        reusable: true
      },
      rows: rowsWithComponents
    }),
    is_published: widget.is_published
  });
}
```

### Phase 3: Validation

1. Count records: Compare old vs new
2. Verify structure: Check JSON structure integrity
3. Test queries: Verify JSON path queries work
4. Performance test: Benchmark single-object queries

### Phase 4: Cutover

1. Update application code to use new schema
2. Run in parallel for validation period
3. Switch reads to new table
4. Switch writes to new table
5. Remove old tables after verification

## Query Examples

### Get Complete Page Object

```sql
-- Single query gets everything
SELECT * FROM components 
WHERE component_type = 'page' 
  AND id = ?;
```

### Find All Pages by User

```sql
SELECT * FROM components 
WHERE component_type = 'page' 
  AND user_id = ? 
ORDER BY data->'meta'->>'menuOrder';
```

### Find Published Pages

```sql
SELECT * FROM components 
WHERE component_type = 'page' 
  AND is_published = true 
ORDER BY created_at DESC;
```

### Search Components Within a Page (JSON Path Query)

**PostgreSQL:**
```sql
SELECT * FROM components 
WHERE component_type = 'page' 
  AND id = ?
  AND data->'rows'->0->'components'->0->'data'->'content'->>'text' ILIKE '%search%';
```

**MySQL:**
```sql
SELECT * FROM components 
WHERE component_type = 'page' 
  AND id = ?
  AND JSON_EXTRACT(data, '$.rows[0].components[0].data.content.text') LIKE '%search%';
```

**SQLite:**
```sql
SELECT * FROM components 
WHERE component_type = 'page' 
  AND id = ?
  AND json_extract(data, '$.rows[0].components[0].data.content.text') LIKE '%search%';
```

### Find All Widgets in a Category

```sql
SELECT * FROM components 
WHERE component_type = 'widget' 
  AND data->'meta'->>'category' = ?;
```

## Indexing Strategy

### JSON Path Indexing

**PostgreSQL:**
```sql
-- Index for frequently queried JSON paths
CREATE INDEX idx_components_meta_menu_order 
ON components USING GIN ((data->'meta'->>'menuOrder'));

-- Index for component types within pages
CREATE INDEX idx_components_rows_components_type 
ON components USING GIN ((data->'rows'->'components'->'componentType'));
```

**MySQL:**
```sql
-- Generated column for menu order
ALTER TABLE components 
ADD COLUMN menu_order INT 
GENERATED ALWAYS AS (CAST(JSON_EXTRACT(data, '$.meta.menuOrder') AS UNSIGNED)) STORED,
ADD INDEX idx_menu_order (menu_order);
```

## Data Validation Rules

### Application-Level Validation

Since everything is in JSON, validation happens at the application level:

```typescript
interface ComponentData {
  meta?: {
    menuOrder?: number;
    layoutId?: string | null;
    seo?: SEOConfig;
    category?: string;
    reusable?: boolean;
    // ... type-specific meta
  };
  rows?: Row[];
  sections?: Section[];  // For forms
  joins?: Join[];         // For queries
  fields?: Field[];       // For queries
  // ... other type-specific structures
}

interface Row {
  id: string;
  position: number;
  columns: number;
  columnWidths?: number[];
  styles?: Record<string, any>;
  responsiveConfig?: Record<string, any>;
  components: NestedComponent[];
}

interface NestedComponent {
  id: string;
  componentType: string;
  position: number;
  columnIndex: number;
  data: {
    content: Record<string, any>;
    styles?: Record<string, any>;
    config?: Record<string, any>;
  };
}
```

### Database Constraints

```sql
-- Ensure component_type is valid
ALTER TABLE components 
ADD CONSTRAINT chk_component_type 
CHECK (component_type IN ('page', 'widget', 'layout', 'form', 'query', 'api_collection', 'entity', 'template'));
```

## Performance Considerations

1. **Document Size**: Monitor JSON document sizes (recommended < 1MB per object)
2. **JSON Query Performance**: Use indexes on frequently queried paths
3. **Caching**: Cache entire component objects in Redis
4. **Partial Updates**: Use JSON Patch for efficient updates
5. **Batch Operations**: Use transactions for bulk updates

## Benefits of Single-Object Approach

1. **Atomic Operations**: Entire object updated in one transaction
2. **Single Query**: One query retrieves complete object
3. **Simpler Schema**: One main table instead of multiple
4. **Better Caching**: Cache entire objects easily
5. **Consistency**: No referential integrity issues
6. **Versioning**: Easy to version entire objects

## Trade-offs

1. **Query Flexibility**: Harder to query across objects
2. **Update Granularity**: Must update entire object (mitigated by JSON Patch)
3. **Document Size**: Large objects may impact performance
4. **Concurrent Edits**: Need conflict resolution strategy

## Migration Checklist

- [ ] Create unified `components` table
- [ ] Create supporting tables
- [ ] Create all indexes
- [ ] Set up triggers
- [ ] Write migration scripts
- [ ] Test migration on staging data
- [ ] Validate data integrity
- [ ] Performance test new schema
- [ ] Update application code
- [ ] Run migration on production
- [ ] Verify production data
- [ ] Switch application to new table
- [ ] Monitor for issues
- [ ] Remove old tables after verification period
