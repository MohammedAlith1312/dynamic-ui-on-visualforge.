# Migration Scripts Plan

## Overview

This document describes the data migration process from Supabase to the new unified schema. It includes extraction, transformation, and import procedures.

## Migration Strategy

### Phase 1: Preparation
1. Backup Supabase database
2. Set up new database
3. Create unified schema
4. Test migration on staging data

### Phase 2: Data Extraction
1. Extract all data from Supabase
2. Validate data integrity
3. Store in intermediate format (JSON)

### Phase 3: Transformation
1. Transform component data to unified format
2. Transform entity data to unified format
3. Map relationships
4. Validate transformed data

### Phase 4: Import
1. Import to new database
2. Verify data integrity
3. Test queries

### Phase 5: Validation
1. Compare record counts
2. Spot check data
3. Test application functionality

## Migration Scripts

### Extract from Supabase

```javascript
// scripts/migrate/extract-from-supabase.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;

async function extractFromSupabase() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const data = {
    pages: [],
    widgets: [],
    layouts: [],
    pageComponents: [],
    widgetComponents: [],
    layoutComponents: [],
    pageRows: [],
    widgetRows: [],
    layoutRows: [],
    users: []
  };

  // Extract pages
  const { data: pages } = await supabase.from('pages').select('*');
  data.pages = pages || [];

  // Extract widgets
  const { data: widgets } = await supabase.from('widgets').select('*');
  data.widgets = widgets || [];

  // Extract layouts
  const { data: layouts } = await supabase.from('layouts').select('*');
  data.layouts = layouts || [];

  // Extract components
  const { data: pageComponents } = await supabase.from('page_components').select('*');
  data.pageComponents = pageComponents || [];

  const { data: widgetComponents } = await supabase.from('widget_components').select('*');
  data.widgetComponents = widgetComponents || [];

  const { data: layoutComponents } = await supabase.from('layout_components').select('*');
  data.layoutComponents = layoutComponents || [];

  // Extract rows
  const { data: pageRows } = await supabase.from('page_rows').select('*');
  data.pageRows = pageRows || [];

  const { data: widgetRows } = await supabase.from('widget_rows').select('*');
  data.widgetRows = widgetRows || [];

  const { data: layoutRows } = await supabase.from('layout_rows').select('*');
  data.layoutRows = layoutRows || [];

  // Extract users
  const { data: users } = await supabase.auth.admin.listUsers();
  data.users = users?.users || [];

  // Save to file
  await fs.writeFile('migration-data.json', JSON.stringify(data, null, 2));
  console.log('Data extracted successfully');
}

extractFromSupabase();
```

### Transform to Single-Object Structure

```javascript
// scripts/migrate/transform-to-single-object.js
const fs = require('fs').promises;

async function transformToSingleObject() {
  const data = JSON.parse(await fs.readFile('migration-data.json', 'utf8'));
  const components = [];

  // Transform pages
  for (const page of data.pages) {
    // Get all rows for this page
    const pageRows = data.pageRows
      .filter(row => row.page_id === page.id)
      .sort((a, b) => a.position - b.position);
    
    // Get all components for this page
    const pageComponents = data.pageComponents.filter(comp => comp.page_id === page.id);
    
    // Build nested structure: rows with their components
    const rowsWithComponents = pageRows.map(row => {
      const rowComponents = pageComponents
        .filter(comp => comp.row_id === row.id)
        .map(comp => ({
          id: comp.id,
          componentType: comp.component_type,
          position: comp.position || 0,
          columnIndex: comp.column_index || 0,
          data: {
            content: comp.content || {},
            styles: comp.styles || {},
            config: {},
            widgetId: comp.widget_id || null,
            isWidgetInstance: comp.is_widget_instance || false
          }
        }))
        .sort((a, b) => {
          // Sort by columnIndex first, then position
          if (a.columnIndex !== b.columnIndex) {
            return a.columnIndex - b.columnIndex;
          }
          return a.position - b.position;
        });
      
      return {
        id: row.id,
        position: row.position || 0,
        columns: row.columns || 1,
        columnWidths: row.column_widths || null,
        styles: row.styles || {},
        responsiveConfig: row.responsive_config || {},
        components: rowComponents
      };
    });
    
    // Create complete component object
    components.push({
      id: page.id,
      component_type: 'page',
      name: page.slug,
      slug: page.slug,
      user_id: page.user_id,
      title: page.title,
      description: null,
      data: JSON.stringify({
        meta: {
          menuOrder: page.menu_order || 0,
          layoutId: page.layout_id || null,
          seo: page.seo || {}
        },
        rows: rowsWithComponents
      }),
      is_published: page.is_published || false,
      metadata: JSON.stringify({}),
      created_at: page.created_at,
      updated_at: page.updated_at
    });
  }

  // Transform widgets
  for (const widget of data.widgets) {
    const widgetRows = data.widgetRows
      .filter(row => row.widget_id === widget.id)
      .sort((a, b) => a.position - b.position);
    
    const widgetComponents = data.widgetComponents.filter(comp => comp.widget_id === widget.id);
    
    const rowsWithComponents = widgetRows.map(row => {
      const rowComponents = widgetComponents
        .filter(comp => comp.row_id === row.id)
        .map(comp => ({
          id: comp.id,
          componentType: comp.component_type,
          position: comp.position || 0,
          columnIndex: comp.column_index || 0,
          data: {
            content: comp.content || {},
            styles: comp.styles || {},
            config: {}
          }
        }))
        .sort((a, b) => {
          if (a.columnIndex !== b.columnIndex) {
            return a.columnIndex - b.columnIndex;
          }
          return a.position - b.position;
        });
      
      return {
        id: row.id,
        position: row.position || 0,
        columns: row.columns || 1,
        columnWidths: row.column_widths || null,
        styles: row.styles || {},
        responsiveConfig: row.responsive_config || {},
        components: rowComponents
      };
    });
    
    const slug = widget.title.toLowerCase().replace(/\s+/g, '-');
    components.push({
      id: widget.id,
      component_type: 'widget',
      name: slug,
      slug: slug,
      user_id: widget.user_id,
      title: widget.title,
      description: null,
      data: JSON.stringify({
        meta: {
          category: widget.category || null,
          reusable: true
        },
        rows: rowsWithComponents
      }),
      is_published: widget.is_published || false,
      metadata: JSON.stringify({}),
      created_at: widget.created_at,
      updated_at: widget.updated_at
    });
  }

  // Transform layouts
  for (const layout of data.layouts) {
    const layoutRows = data.layoutRows
      .filter(row => row.layout_id === layout.id)
      .sort((a, b) => a.position - b.position);
    
    const layoutComponents = data.layoutComponents.filter(comp => comp.layout_id === layout.id);
    
    const rowsWithComponents = layoutRows.map(row => {
      const rowComponents = layoutComponents
        .filter(comp => comp.row_id === row.id)
        .map(comp => ({
          id: comp.id,
          componentType: comp.component_type,
          position: comp.position || 0,
          columnIndex: comp.column_index || 0,
          data: {
            content: comp.content || {},
            styles: comp.styles || {},
            config: {}
          }
        }))
        .sort((a, b) => {
          if (a.columnIndex !== b.columnIndex) {
            return a.columnIndex - b.columnIndex;
          }
          return a.position - b.position;
        });
      
      return {
        id: row.id,
        position: row.position || 0,
        columns: row.columns || 1,
        columnWidths: row.column_widths || null,
        styles: row.styles || {},
        responsiveConfig: row.responsive_config || {},
        components: rowComponents
      };
    });
    
    const slug = layout.title.toLowerCase().replace(/\s+/g, '-');
    components.push({
      id: layout.id,
      component_type: 'layout',
      name: slug,
      slug: slug,
      user_id: layout.user_id,
      title: layout.title,
      description: null,
      data: JSON.stringify({
        meta: {},
        rows: rowsWithComponents
      }),
      is_published: layout.is_published || false,
      metadata: JSON.stringify({}),
      created_at: layout.created_at,
      updated_at: layout.updated_at
    });
  }

  // Save transformed data
  await fs.writeFile('transformed-components.json', JSON.stringify(components, null, 2));
  console.log(`Transformed ${components.length} components to single-object structure`);
}

transformToSingleObject();
```

### Import to New Database

```javascript
// scripts/migrate/import-to-database.js
const fs = require('fs').promises;
const { getDatabase } = require('../../backend/src/config/database');

async function importToDatabase() {
  const db = await getDatabase();

  // Import components (all objects in single table)
  const components = JSON.parse(await fs.readFile('transformed-components.json', 'utf8'));
  console.log(`Importing ${components.length} components...`);

  // Batch insert for performance
  const batchSize = 50; // Smaller batch size due to larger JSON objects
  for (let i = 0; i < components.length; i += batchSize) {
    const batch = components.slice(i, i + batchSize);
    await db.transaction(async (tx) => {
      for (const component of batch) {
        try {
          await tx.insert('components', component);
        } catch (error) {
          console.error(`Error importing component ${component.id}:`, error.message);
        }
      }
    });
    
    console.log(`Imported ${Math.min(i + batchSize, components.length)}/${components.length} components`);
  }

  console.log('Import completed');
}

importToDatabase();
```

### Validation Script

```javascript
// scripts/migrate/validate-migration.js
const { getDatabase } = require('../../backend/src/config/database');
const fs = require('fs').promises;

async function validateMigration() {
  const db = await getDatabase();
  const originalData = JSON.parse(await fs.readFile('migration-data.json', 'utf8'));

  // Count components (all objects in single table)
  const pageCount = originalData.pages.length;
  const widgetCount = originalData.widgets.length;
  const layoutCount = originalData.layouts.length;

  const newPageCount = await db.query('SELECT COUNT(*) as count FROM components WHERE component_type = ?', ['page']);
  const newWidgetCount = await db.query('SELECT COUNT(*) as count FROM components WHERE component_type = ?', ['widget']);
  const newLayoutCount = await db.query('SELECT COUNT(*) as count FROM components WHERE component_type = ?', ['layout']);

  console.log('Component counts:');
  console.log(`Pages: ${pageCount} -> ${newPageCount[0]?.count || newPageCount[0] || 0}`);
  console.log(`Widgets: ${widgetCount} -> ${newWidgetCount[0]?.count || newWidgetCount[0] || 0}`);
  console.log(`Layouts: ${layoutCount} -> ${newLayoutCount[0]?.count || newLayoutCount[0] || 0}`);

  // Validate nested structure
  const samplePage = originalData.pages[0];
  if (samplePage) {
    const migratedPage = await db.findOne('components', { id: samplePage.id });
    if (migratedPage) {
      const pageData = JSON.parse(migratedPage.data);
      
      // Count rows
      const originalRowCount = originalData.pageRows.filter(r => r.page_id === samplePage.id).length;
      const migratedRowCount = pageData.rows?.length || 0;
      
      // Count nested components
      const originalCompCount = originalData.pageComponents.filter(c => c.page_id === samplePage.id).length;
      const migratedCompCount = pageData.rows?.reduce((sum, row) => sum + (row.components?.length || 0), 0) || 0;
      
      console.log('Sample page structure validation:');
      console.log(`Title match: ${samplePage.title === migratedPage.title}`);
      console.log(`Rows: ${originalRowCount} -> ${migratedRowCount}`);
      console.log(`Nested components: ${originalCompCount} -> ${migratedCompCount}`);
    }
  }
}

validateMigration();
```

## Rollback Procedure

```javascript
// scripts/migrate/rollback.js
const { getDatabase } = require('../../backend/src/config/database');

async function rollback() {
  const db = await getDatabase();

  console.log('Rolling back migration...');

  // Delete imported data
  await db.query('DELETE FROM components');

  console.log('Rollback completed');
}

rollback();
```

## Migration Checklist

- [ ] Backup Supabase database
- [ ] Set up new database
- [ ] Create unified components table schema
- [ ] Extract data from Supabase
- [ ] Transform to single-object structure (nested rows and components)
- [ ] Import components (all objects in single table)
- [ ] Validate migration (counts and structure)
- [ ] Test application with new schema
- [ ] Switch application to new database
- [ ] Monitor for issues
- [ ] Remove old Supabase dependencies

