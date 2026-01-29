# Visual Forge Hub - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [Key Components](#key-components)
8. [Development Setup](#development-setup)
9. [Deployment](#deployment)
10. [API & Edge Functions](#api--edge-functions)
11. [Future Roadmap](#future-roadmap)

---

## Project Overview

**Visual Forge Hub** is a comprehensive visual page builder and content management platform that enables users to create, manage, and publish dynamic web pages, forms, database entities, API collections, and queries without writing code.

### Core Purpose
- **Visual Page Builder**: Drag-and-drop interface for creating pages, widgets, and layouts
- **Form Builder**: Dynamic form creation with validation and conditional logic
- **Entity Management**: Database entity creation and record management
- **Query Builder**: Visual SQL query builder for multi-entity joins
- **API Client**: Postman-like REST API testing and collection management
- **Template System**: Reusable templates for pages, widgets, and layouts

### Target Users
- Web developers and designers
- Content creators
- Business users who need to create web content without coding
- Teams managing multiple websites or applications

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Admin UI   │  │  Page Editor │  │  Public Pages │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Backend                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │ Edge Functions│  │   Storage      │     │
│  │   Database   │  │               │  │   (Files)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

1. **Component-Based Architecture**: React components with reusable UI elements
2. **Row-Based Layout System**: Pages organized into rows with 1-4 columns
3. **Drag-and-Drop**: Using `@dnd-kit` for intuitive component placement
4. **Serverless Functions**: Supabase Edge Functions for server-side operations
5. **Real-time Updates**: Supabase Realtime for live data synchronization
6. **Row-Level Security (RLS)**: Database-level security policies

---

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **Routing**: React Router DOM 6.30.1
- **State Management**: React Query (TanStack Query) 5.83.0
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 3.4.17
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Forms**: React Hook Form 7.61.1 + Zod 3.25.76
- **Charts**: Recharts 2.15.4
- **Icons**: Lucide React 0.462.0

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Edge Functions**: Deno-based serverless functions
- **Real-time**: Supabase Realtime subscriptions

### Development Tools
- **Linting**: ESLint 9.32.0
- **Type Checking**: TypeScript 5.8.3
- **Package Manager**: npm/bun

---

## Features

### 1. Visual Page Builder

**Pages, Widgets, and Layouts**
- Drag-and-drop component placement
- Row-based layout system (1-4 columns)
- Inline component editing
- Copy/paste/duplicate functionality
- Preview modal before publishing
- Widget reusability across pages

**Components Available:**
- Text, Heading, Image, Video, Button
- Entity List, Entity Detail
- Query Results
- Forms
- Charts
- Custom HTML

**Current Limitations (Planned Improvements):**
- No styling options (spacing, colors, backgrounds)
- No responsive design controls
- Fixed column widths only
- Basic components without variants

### 2. Form Builder

**Features:**
- Drag-and-drop form creation
- 22+ field types (text, email, select, file upload, etc.)
- Validation rules (min/max, patterns, custom messages)
- Conditional logic (show/hide fields based on other fields)
- Multi-step forms (tabs)
- Repeatable sections
- Form submissions management
- Export submissions to CSV/JSON

**Field Types:**
- Text-based: Text, Email, Phone, URL, Password, Textarea, Rich Text
- Number-based: Number, Range, Rating
- Date/Time: Date, Time, Datetime
- Selection: Select, Multi-select, Radio, Checkbox
- File: File Upload, Image Upload
- Advanced: Color, Signature, Hidden

### 3. Entity Management

**Features:**
- Create custom database entities
- Define fields with types (text, number, date, etc.)
- Create and manage entity records
- Multiple view types (table, grid, card)
- Field-level permissions
- Published/unpublished records

**Entity System:**
- Entities stored as JSONB in `entity_records` table
- Flexible schema without migrations
- Support for relationships between entities

### 4. Query Builder

**Features:**
- Visual query builder for database queries
- Multi-entity joins (INNER, LEFT, RIGHT)
- Field selection from multiple entities
- Filter conditions (equals, contains, greater than, etc.)
- Aggregate queries (COUNT, SUM, AVG, MIN, MAX)
- Grouping and sorting
- Display styles (table, grid, list)
- Results pagination

**Query Types:**
- **Flat Queries**: Join multiple entities and return flat results
- **Aggregate Queries**: Group data and calculate aggregates

### 5. REST API Client

**Features:**
- Postman-like interface
- Organize requests into collections
- Folder structure for organization
- Request configuration (method, URL, headers, body)
- Multiple authentication types (Bearer, Basic, API Key)
- Request execution via edge function
- Response viewer with syntax highlighting
- Request history tracking
- Import/Export Postman collections

**Request Types:**
- GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS

**Body Types:**
- None, JSON, Form Data, x-www-form-urlencoded, Raw, Binary

### 6. Template System

**Features:**
- Page templates
- Widget templates
- Layout templates
- Form templates
- Section templates (planned)
- Save current design as template
- Import/Export templates

---

## Project Structure

```
visual-forge-hub/
├── public/                    # Static assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── admin/             # Admin panel components
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── CreatePageDialog.tsx
│   │   │   ├── PageList.tsx
│   │   │   └── ...
│   │   ├── api/               # API client components
│   │   │   ├── ApiRequestEditor.tsx
│   │   │   ├── ApiResponseViewer.tsx
│   │   │   └── ...
│   │   ├── editor/            # Page editor components
│   │   │   ├── ComponentsSidebar.tsx
│   │   │   ├── DraggableComponent.tsx
│   │   │   ├── SortableRow.tsx
│   │   │   └── ...
│   │   ├── entities/          # Entity management components
│   │   │   ├── EntityRecordDialog.tsx
│   │   │   ├── FieldEditor.tsx
│   │   │   └── ...
│   │   ├── forms/             # Form builder components
│   │   │   ├── FormCanvas.tsx
│   │   │   ├── FieldLibrary.tsx
│   │   │   └── ...
│   │   ├── queries/           # Query builder components
│   │   │   ├── QueryJoinBuilder.tsx
│   │   │   ├── QueryFieldSelector.tsx
│   │   │   └── ...
│   │   ├── public/            # Public page components
│   │   │   ├── ComponentRenderer.tsx
│   │   │   └── ChartRenderer.tsx
│   │   └── ui/                # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       └── ...
│   │
│   ├── contexts/              # React contexts
│   │   └── ClipboardContext.tsx
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useHistory.ts
│   │   └── useKeyboardShortcuts.ts
│   │
│   ├── integrations/          # Third-party integrations
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   │
│   ├── lib/                   # Utility functions
│   │   └── utils.ts
│   │
│   ├── pages/                 # Page components
│   │   ├── Admin.tsx
│   │   ├── PageEditor.tsx
│   │   ├── FormBuilder.tsx
│   │   ├── EntityEditor.tsx
│   │   ├── QueryEditor.tsx
│   │   ├── ApiCollectionEditor.tsx
│   │   ├── PublicPage.tsx
│   │   └── ...
│   │
│   ├── App.tsx                # Main app component with routing
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles
│
├── supabase/
│   ├── functions/             # Edge functions
│   │   ├── execute-query/
│   │   │   └── index.ts
│   │   └── execute-api-request/
│   │       └── index.ts
│   ├── migrations/            # Database migrations
│   │   └── *.sql
│   └── config.toml            # Supabase configuration
│
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Basic project info
```

---

## Database Schema

### Core Tables

#### Pages, Widgets, Layouts
- `pages`: Page definitions
- `page_rows`: Rows within pages
- `page_components`: Components within rows
- `widgets`: Reusable widget definitions
- `widget_rows`, `widget_components`: Widget structure
- `layouts`: Layout templates
- `layout_rows`, `layout_components`: Layout structure

#### Entities
- `entities`: Entity definitions
- `entity_fields`: Field definitions for entities
- `entity_records`: Actual data records (JSONB storage)
- `entity_views`: View configurations

#### Forms
- `forms`: Form definitions
- `form_sections`: Sections/tabs within forms
- `form_fields`: Form field definitions
- `form_submissions`: Form submission data

#### Queries
- `queries`: Query definitions
- `query_joins`: Join relationships
- `query_fields`: Selected fields
- `query_conditions`: Filter conditions
- `query_settings`: Query execution settings

#### API Collections
- `api_collections`: API collection definitions
- `api_folders`: Folder organization
- `api_requests`: API request configurations
- `api_request_history`: Request execution history

#### Templates
- `templates`: Template definitions
- `template_rows`, `template_components`: Template structure

### Security

All tables use **Row-Level Security (RLS)** policies:
- Users can only manage their own resources
- Published resources are viewable by all authenticated users
- Public pages are accessible without authentication

---

## Key Components

### Admin Components

#### `AdminLayout.tsx`
Main layout for admin panel with:
- Sidebar navigation
- Collapsible sections (Pages, Widgets, Entities, etc.)
- Real-time data synchronization
- User authentication state

#### `PageEditor.tsx`
Visual page builder with:
- Component sidebar
- Drag-and-drop canvas
- Row management
- Component properties panel
- Preview functionality

### Editor Components

#### `ComponentsSidebar.tsx`
Lists available components grouped by category:
- Basic: Text, Heading, Image, Button
- Database: Entity List, Entity Detail, Query
- Forms: Form component
- Advanced: Chart, HTML

#### `DraggableComponent.tsx`
Wrapper for draggable components with:
- Drag handles
- Selection state
- Context menu
- Inline editing

#### `SortableRow.tsx`
Row container with:
- Column layout (1-4 columns)
- Component drop zones
- Row actions (delete, duplicate)

### Public Components

#### `ComponentRenderer.tsx`
Renders components on public pages:
- Fetches component data
- Renders based on component type
- Handles entity data fetching
- Executes queries via edge functions

#### `PublicPage.tsx`
Public-facing page renderer:
- Fetches page data
- Renders rows and components
- Handles routing by slug

---

## Development Setup

### Prerequisites
- Node.js 18+ (recommended: use nvm)
- npm or bun
- Supabase account and project

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd visual-forge-hub

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials:
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-key
```

### Development Server

```bash
# Start development server
npm run dev
# or
bun run dev

# Server runs on http://localhost:8080
```

### Database Setup

```bash
# Link to your Supabase project
npx supabase link --project-ref your-project-ref

# Run migrations
npx supabase db push

# Or apply migrations manually in Supabase dashboard
```

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

---

## Deployment

### Lovable Platform
The project is configured for deployment on Lovable:
1. Open [Lovable Project](https://lovable.dev/projects/d8f465d3-b552-433a-a1fe-1162f398d48a)
2. Click **Share → Publish**
3. Configure custom domain (optional)

### Manual Deployment

#### Vercel/Netlify
1. Connect repository to Vercel/Netlify
2. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Deploy

#### Custom Server
1. Build the project: `npm run build`
2. Serve the `dist/` folder with a static file server
3. Configure environment variables

### Supabase Edge Functions

Deploy edge functions:
```bash
# Deploy all functions
npx supabase functions deploy

# Deploy specific function
npx supabase functions deploy execute-query
npx supabase functions deploy execute-api-request
```

---

## API & Edge Functions

### Edge Functions

#### `execute-query`
Executes database queries based on query configuration.

**Input:**
```json
{
  "queryId": "uuid-of-query"
}
```

**Output:**
```json
{
  "success": true,
  "data": [...],
  "rowCount": 10
}
```

#### `execute-api-request`
Executes HTTP requests to external APIs (proxy for CORS handling).

**Input:**
```json
{
  "requestId": "uuid-of-request",
  "overrides": {
    "url": "optional-override",
    "headers": {}
  }
}
```

**Output:**
```json
{
  "success": true,
  "statusCode": 200,
  "headers": {},
  "body": {},
  "responseTime": 150
}
```

### Supabase Client Usage

```typescript
import { supabase } from "@/integrations/supabase/client";

// Query data
const { data, error } = await supabase
  .from('pages')
  .select('*')
  .eq('user_id', userId);

// Insert data
const { data, error } = await supabase
  .from('pages')
  .insert({ name: 'New Page', user_id: userId });

// Real-time subscription
const subscription = supabase
  .channel('pages')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'pages' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();
```

---

## Future Roadmap

### Planned Improvements

#### Phase 1: Foundation Improvements
- ✅ Core features implemented
- ⏳ Row & component styling system
- ⏳ Undo/Redo functionality
- ⏳ Flexible column widths
- ⏳ Section templates library

#### Phase 2: Advanced Layout Features
- ⏳ Responsive breakpoint controls
- ⏳ Mobile/tablet preview
- ⏳ Container width options
- ⏳ Nested layouts

#### Phase 3: Component Library Expansion
- ⏳ Advanced components (Tabs, Accordion, Carousel)
- ⏳ Form components suite
- ⏳ Component variants system
- ⏳ Navigation components

#### Phase 4: Editor UX Enhancements
- ⏳ Component tree/outline panel
- ⏳ Context menu system
- ⏳ Multi-select & bulk actions
- ⏳ Visual spacing guides

#### Phase 5: Content & Media Management
- ⏳ Rich text editor integration
- ⏳ Media library
- ⏳ Content variables
- ⏳ Bulk content editing

#### Phase 6: Templates & AI Features
- ⏳ Page templates system
- ⏳ AI-powered layout generation
- ⏳ AI content generation
- ⏳ Template marketplace

#### Phase 7: Polish & Performance
- ⏳ Auto-save & version history
- ⏳ Accessibility checker
- ⏳ SEO metadata editor
- ⏳ Animation & interactions

#### Phase 8: Performance Optimizations
- ⏳ Lazy loading & code splitting
- ⏳ Real-time collaboration
- ⏳ Performance monitoring
- ⏳ Caching strategies

### Feature Documentation

Detailed implementation plans are available in:
- `form feature.md` - Form builder implementation plan
- `Query feature .md` - Query builder implementation plan
- `RESTAPIclient.md` - API client implementation plan
- `Plan to Improve Pages-Widge-Layout.md` - Page builder improvements

---

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Use shadcn/ui components when possible
- Write descriptive component and function names
- Add comments for complex logic

### Component Structure
```typescript
// Component file structure
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ComponentProps {
  // Props interface
}

export const Component = ({ prop }: ComponentProps) => {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
  return <div>...</div>;
};
```

### Database Changes
- Create migrations for all schema changes
- Update RLS policies
- Test with different user roles
- Document breaking changes

---

## Support & Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Vite Documentation](https://vitejs.dev)

### Project Links
- **Lovable Project**: https://lovable.dev/projects/d8f465d3-b552-433a-a1fe-1162f398d48a
- **Repository**: (Git URL from README)

---

## License

[Add license information here]

---

## Changelog

### Version 0.0.0 (Current)
- Initial project setup
- Core page builder functionality
- Entity management system
- Form builder (planned)
- Query builder (planned)
- API client (planned)
- Template system (planned)

---

**Last Updated**: November 2024
**Maintained By**: Visual Forge Hub Team

