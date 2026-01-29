I'd be happy to help you improve the Pages/Widget/Layout designing experience! Let me first examine the current implementation to understand the workflow and identify areas for enhancement.

Based on my analysis of your current Pages/Widget/Layout system, I can see you have a solid foundation with drag-and-drop components, row-based layouts, and inline editing. Let me identify the key areas for improvement and create a comprehensive plan.

## Current System Analysis

**Strengths:**
- ✅ Drag-and-drop from sidebar
- ✅ Row-based layout with 1-4 columns
- ✅ Inline component editing
- ✅ Copy/paste/duplicate functionality
- ✅ Preview modal
- ✅ Widget reusability

**Areas for Improvement:**

### 1. **Visual Design & Styling System**
**Current limitation:** Components have no styling options (spacing, colors, backgrounds, borders)

**Improvements:**
- Add spacing controls (padding, margin) per component
- Add background colors/images/gradients per row
- Add border radius, shadow, and border options
- Global theme system with design tokens
- Component-level styling panel (text color, font size, alignment)

### 2. **Responsive Design Controls**
**Current limitation:** No mobile/tablet preview or responsive settings

**Improvements:**
- Breakpoint-based column configuration (desktop: 3 cols, tablet: 2 cols, mobile: 1 col)
- Hide/show components per breakpoint
- Mobile-first editing mode with device preview switcher
- Responsive spacing controls

### 3. **Advanced Layout Options**
**Current limitation:** Only grid layout with equal columns

**Improvements:**
- Flexible column widths (33%-66%, 25%-75%, etc.)
- Flexbox layout option (horizontal/vertical alignment, wrap, gap)
- Container width options (full-width, contained, narrow)
- Section templates (hero, cards, testimonials, etc.)
- Nested layouts (sections within sections)

### 4. **Component Library Enhancements**
**Current limitation:** Basic components with no variants

**Improvements:**
- Component variants (button: primary/secondary/ghost, heading: display/title/body)
- Advanced components (tabs, accordions, carousels, modals)
- Form components (inputs, selects, textareas with validation)
- Navigation components (navbar, footer, breadcrumbs)
- Save custom component groups as "Blocks"
- Component presets library

### 5. **Editor UX Improvements**
**Current limitation:** Limited interaction and feedback

**Improvements:**
- Undo/Redo history (Cmd+Z / Cmd+Shift+Z)
- Keyboard shortcuts (duplicate: Cmd+D, delete: Delete/Backspace)
- Right-click context menu on components
- Multi-select components (Shift+Click)
- Component tree/outline view (see hierarchy)
- Quick actions toolbar (floating when component selected)
- Visual indicators for padding/margin (like Figma)
- Grid guides and alignment helpers

### 6. **Content Management**
**Current limitation:** Manual editing only

**Improvements:**
- Rich text editor (formatting, links, images inline)
- Media library for images/videos
- Content variables/placeholders (reusable text snippets)
- Bulk edit similar components
- Search and replace content

### 7. **Templates & Presets**
**Current limitation:** Always start from scratch

**Improvements:**
- Page templates (landing page, blog post, contact, etc.)
- Section templates (hero, features, pricing, testimonials)
- Quick start wizard with template selection
- Save current page as template
- Import/export templates as JSON

### 8. **Performance & Polish**
**Current limitation:** Basic functionality

**Improvements:**
- Real-time collaboration indicators (if multi-user)
- Auto-save with drafts
- Version history (restore previous versions)
- Component validation (warn about missing images, broken links)
- Accessibility checker (contrast ratios, alt text, headings)
- SEO metadata editor (per page)

### 9. **Animation & Interactions**
**Current limitation:** Static components

**Improvements:**
- Entrance animations (fade in, slide in, zoom)
- Hover effects (scale, shadow, color change)
- Scroll animations (parallax, reveal on scroll)
- Click interactions (open modal, show/hide content)

### 10. **AI-Powered Features**
**Current limitation:** Manual design work

**Improvements:**
- Generate layout from description ("Create a pricing section with 3 tiers")
- Auto-suggest component placements
- Content generation (write compelling copy)
- Image suggestions from description
- Design system recommendations

---

## Implementation Roadmap: Enhanced Page/Widget/Layout Builder

### Phase 1: Foundation Improvements (High Impact, Quick Wins)

#### 1.1 Add Row Styling Panel
- Create `RowPropertiesPanel.tsx` component
- Add background color/gradient/image picker
- Add padding controls (top, bottom, left, right)
- Add border radius and shadow options
- Update database: add `styles` JSONB column to `page_rows`, `widget_rows`, `layout_rows`

#### 1.2 Add Component Styling System
- Create `ComponentStylePanel.tsx` with accordion sections:
  - **Spacing**: margin and padding controls
  - **Colors**: text color, background color
  - **Typography**: font size, weight, alignment
  - **Effects**: border radius, shadow, border
- Add `styles` JSONB column to component tables
- Update `DraggableComponent` to show style panel on selection

#### 1.3 Undo/Redo System
- Create `useHistory` hook with command pattern
- Track all operations (add, delete, update, move)
- Add Undo/Redo buttons to header
- Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)

#### 1.4 Keyboard Shortcuts
- Create `useKeyboardShortcuts` hook
- Implement: Delete (Backspace), Duplicate (Cmd+D), Copy (Cmd+C), Paste (Cmd+V)
- Show shortcut hints in tooltips

### Phase 2: Advanced Layout Features

#### 2.1 Flexible Column Widths
- Replace fixed `columns: number` with `columnWidths: number[]` (e.g., [33, 67])
- Update `SortableRow` to render dynamic column widths
- Add column width editor (drag handles between columns)
- Presets: Equal, 2/3-1/3, 1/3-2/3, 1/4-3/4, Golden Ratio

#### 2.2 Responsive Breakpoints
- Add `responsiveConfig` JSONB to row tables:
  ```json
  {
    "desktop": { "columns": [50, 50] },
    "tablet": { "columns": [100] },
    "mobile": { "columns": [100] }
  }
  ```
- Create `ResponsiveControls` component with breakpoint tabs
- Add device preview switcher to header (Desktop/Tablet/Mobile buttons)
- Conditional component visibility per breakpoint

#### 2.3 Section Templates Library
- Create `SectionTemplatesDialog.tsx`
- Pre-built templates:
  - Hero sections (with CTA, image, background)
  - Feature grids (3-column, 4-column with icons)
  - Pricing tables (2-tier, 3-tier)
  - Testimonials (cards, carousel)
  - FAQ (accordion style)
  - Contact forms
  - Footer layouts
- "Insert Template" button above canvas
- Store templates in `section_templates` table

### Phase 3: Component Library Expansion

#### 3.1 Advanced Components
- **Tabs Component**: 
  - Create `TabsComponentEditor.tsx`
  - Manage multiple tab panels with content
  - Drag-and-drop other components into tabs
- **Accordion Component**:
  - Create `AccordionComponentEditor.tsx`
  - Multiple collapsible sections
- **Card Component**:
  - Predefined layouts (image-top, image-left, pricing card)
  - Nested components inside cards

#### 3.2 Form Components Suite
- Create form-specific components:
  - Input field (with label, placeholder, validation)
  - Textarea
  - Select dropdown
  - Checkbox/Radio groups
  - Submit button with form integration
- Form builder with validation rules
- Connect to entity forms or custom endpoints

#### 3.3 Component Variants System
- Update component definitions to include `variants`:
  ```typescript
  {
    type: "button",
    variants: {
      style: ["primary", "secondary", "outline", "ghost"],
      size: ["sm", "md", "lg"],
      fullWidth: boolean
    }
  }
  ```
- Add variant selector to component editors
- Store selected variant in component content

### Phase 4: Editor UX Enhancements

#### 4.1 Component Tree/Outline Panel
- Create `OutlinePanel.tsx` sidebar
- Hierarchical view: Page → Rows → Columns → Components
- Click to select, drag to reorder
- Show/hide, lock/unlock components
- Toggle between Sidebar (components) and Outline (structure)

#### 4.2 Context Menu System
- Create `ComponentContextMenu.tsx`
- Right-click on component shows:
  - Edit, Duplicate, Copy, Paste, Delete
  - Move to top/bottom
  - Save as Block
  - Change variant
- Right-click on row: Add row above/below, Duplicate row

#### 4.3 Multi-Select & Bulk Actions
- Cmd+Click or Shift+Click to select multiple components
- Bulk operations: Delete all, Duplicate all, Change style
- Show selection count in footer

#### 4.4 Visual Spacing Guides
- Add overlay showing padding/margin boxes (like Figma/Chrome DevTools)
- Blue for padding, orange for margin
- Toggle with "Show Spacing" button
- Alignment guides when dragging (snapping)

### Phase 5: Content & Media Management

#### 5.1 Rich Text Editor Integration
- Replace simple textarea in `TextComponentEditor` with TipTap or Lexical
- Toolbar: Bold, Italic, Underline, Headings, Lists, Links, Images
- Inline formatting without leaving editor
- Markdown support (optional)

#### 5.2 Media Library
- Create `MediaLibraryDialog.tsx`
- Upload images/videos to Supabase Storage
- Browse, search, and organize media
- Insert from library into Image/Video components
- Drag-and-drop upload

#### 5.3 Content Variables
- Create global variables (company name, contact info, etc.)
- Insert variables into text: `{{company.name}}`
- Manage in Settings → Content Variables
- Replace on render

### Phase 6: Templates & AI Features

#### 6.1 Page Templates System
- Create `PageTemplatesDialog.tsx` on page creation
- Pre-built full-page layouts:
  - Landing page
  - About us
  - Services/Product page
  - Blog post
  - Contact page
  - Portfolio
- Save current page as template (with preview screenshot)
- Share templates between projects

#### 6.2 AI-Powered Layout Generation
- "Generate Section" button
- Prompt: "Create a pricing section with 3 tiers"
- Uses Lovable AI to generate row + components structure
- Preview before inserting
- Refine with follow-up prompts

#### 6.3 AI Content Generation
- "Generate Content" button in text editors
- Prompt: "Write a compelling hero section for a SaaS product"
- Fills in placeholder content
- Option to regenerate or edit

### Phase 7: Polish & Performance

#### 7.1 Auto-save & Version History
- Implement debounced auto-save (save every 3s after changes)
- Store snapshots in `page_versions` table
- "Restore Previous Version" dropdown
- Show last saved timestamp

#### 7.2 Accessibility & SEO
- Create `AccessibilityChecker.tsx` panel
- Check for:
  - Alt text on images
  - Proper heading hierarchy
  - Color contrast ratios
  - Focus indicators
- SEO metadata editor per page (title, description, OG image)

#### 7.3 Animation & Interactions
- Create `AnimationPanel.tsx`
- Component-level animations:
  - Entrance: fade-in, slide-up, zoom-in
  - Hover: scale, shadow, color-shift
  - Scroll: reveal-on-scroll, parallax
- Store in component styles, apply with CSS classes

### Phase 8: Performance Optimizations

#### 8.1 Lazy Loading & Code Splitting
- Lazy load component editors
- Virtual scrolling for large page lists
- Optimize image loading (blur placeholder, lazy load)

#### 8.2 Real-time Collaboration (Optional)
- Use Supabase Realtime for collaborative editing
- Show cursors of other editors
- Lock components being edited
- Activity feed

### Database Schema Updates

```sql
-- Add styles to rows
ALTER TABLE page_rows ADD COLUMN styles JSONB DEFAULT '{}';
ALTER TABLE widget_rows ADD COLUMN styles JSONB DEFAULT '{}';
ALTER TABLE layout_rows ADD COLUMN styles JSONB DEFAULT '{}';

-- Add styles to components
ALTER TABLE page_components ADD COLUMN styles JSONB DEFAULT '{}';
ALTER TABLE widget_components ADD COLUMN styles JSONB DEFAULT '{}';
ALTER TABLE layout_components ADD COLUMN styles JSONB DEFAULT '{}';

-- Add responsive config to rows
ALTER TABLE page_rows ADD COLUMN responsive_config JSONB DEFAULT '{}';
ALTER TABLE widget_rows ADD COLUMN responsive_config JSONB DEFAULT '{}';
ALTER TABLE layout_rows ADD COLUMN responsive_config JSONB DEFAULT '{}';

-- Add column widths array
ALTER TABLE page_rows ADD COLUMN column_widths JSONB DEFAULT '[]';
ALTER TABLE widget_rows ADD COLUMN column_widths JSONB DEFAULT '[]';
ALTER TABLE layout_rows ADD COLUMN column_widths JSONB DEFAULT '[]';

-- Section templates
CREATE TABLE section_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  thumbnail_url TEXT,
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Page templates
CREATE TABLE page_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  thumbnail_url TEXT,
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Version history
CREATE TABLE page_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  version_number INTEGER,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Media library
CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  alt_text TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Content variables
CREATE TABLE content_variables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Implementation Priority

**Must-Have (MVP):**
1. Row & component styling system (Phase 1.1, 1.2)
2. Undo/Redo (Phase 1.3)
3. Flexible column widths (Phase 2.1)
4. Section templates (Phase 2.3)
5. Rich text editor (Phase 5.1)

**High Priority:**
1. Responsive controls (Phase 2.2)
2. Component tree/outline (Phase 4.1)
3. Context menu (Phase 4.2)
4. Media library (Phase 5.2)
5. Auto-save & version history (Phase 7.1)

**Nice-to-Have:**
1. Advanced components (Phase 3)
2. AI features (Phase 6.2, 6.3)
3. Animation system (Phase 7.3)
4. Multi-select (Phase 4.3)
5. Real-time collaboration (Phase 8.2)

### Visual Mockup Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ [☰] Page Title        [Desktop▼] [Undo] [Redo]    [Preview] [Publish] │
├────┬────────────────────────────────────────────────────────────┬────┤
│ C  │                                                            │ S  │
│ o  │                     CANVAS AREA                            │ t  │
│ m  │                                                            │ y  │
│ p  │  ┌─────────────────────────────────────────────────┐      │ l  │
│ o  │  │ [Grip] [Cols▼] [BG Color]         [Delete Row]  │      │ e  │
│ n  │  │ ┌────────────┬────────────┬────────────┐        │      │ s  │
│ e  │  │ │ Component  │ Component  │ Component  │        │      │    │
│ n  │  │ │ [•••]      │ [•••]      │ [•••]      │        │      │ P  │
│ t  │  │ └────────────┴────────────┴────────────┘        │      │ a  │
│ s  │  └─────────────────────────────────────────────────┘      │ n  │
│    │                                                            │ e  │
│ S  │  [+ Insert Section Template ▼]                            │ l  │
│ i  │                                                            │    │
│ d  │  [+ Add Row]                                               │    │
│ e  │                                                            │ - Spacing │
│ b  │                                                            │ - Colors  │
│ a  │                                                            │ - Typography │
│ r  │                                                            │ - Effects │
└────┴────────────────────────────────────────────────────────────┴────┘
```

### Success Metrics

- ⏱️ Time to create a landing page: < 5 minutes (from 15+ minutes)
- 🎨 Design consistency: 80% of pages use templates/presets
- 📱 Responsive pages: 100% of new pages have mobile optimization
- ↩️ Undo usage: 30% of users use undo at least once per session
- 🎯 User satisfaction: 4.5+ stars on "ease of use"

I've created a comprehensive improvement plan for your Pages/Widget/Layout system! The plan is structured in 8 phases, starting with quick wins like styling systems and undo/redo, then progressing to advanced features like AI-powered generation and responsive design.

**Key improvements include:**
- 🎨 **Styling System**: Add colors, spacing, backgrounds to rows and components
- 📱 **Responsive Design**: Breakpoint controls and device preview
- ↩️ **Undo/Redo**: History management with keyboard shortcuts
- 📐 **Flexible Layouts**: Custom column widths and advanced arrangements
- 🧩 **Section Templates**: Pre-built layouts for common sections
- 🖼️ **Media Library**: Centralized asset management
- 🤖 **AI Features**: Generate layouts and content from prompts

Would you like me to implement any specific phase from this plan? I'd recommend starting with **Phase 1** (Foundation Improvements) as it provides the most immediate value with styling controls and undo/redo functionality.

Start with Phase 1: Foundation Improvements
Start with Phase 2: Advanced Layouts
Add Section Templates Library
Add Rich Text Editor
Add Component Tree/Outline Panel
