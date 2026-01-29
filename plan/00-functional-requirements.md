# Visual Forge Hub - Functional Requirements Document

## Overview

This document describes the functional capabilities and features of Visual Forge Hub, a visual page builder and content management platform. This document focuses on **what** the system does rather than **how** it's implemented.

---

## 1. Component/Object Management

### 1.1 Unified Object System
- **Single Object Model**: All content types (pages, widgets, layouts, forms, queries, API collections, entities, templates) are stored as unified "components" with a `component_type` identifier
- **Complete Document Storage**: Each object stores all its nested data (rows, components, metadata) in a single JSON document
- **Atomic Operations**: Entire objects can be created, updated, or deleted in a single operation

### 1.2 Component Types Supported
- **Pages**: Web pages with rows and nested components
- **Widgets**: Reusable widget components with categories
- **Layouts**: Layout templates for pages
- **Forms**: Dynamic form definitions with fields and validation
- **Queries**: Database query definitions with joins and conditions
- **API Collections**: REST API collection definitions
- **Entities**: Dynamic entity definitions
- **Templates**: Template definitions for reuse

### 1.3 Object Operations
- **Create**: Create new objects with name, slug, title, description, and complete data structure
- **Read**: Retrieve objects by ID or slug, with full nested data included
- **Update**: Update entire objects or use JSON Patch for partial updates
- **Delete**: Delete objects and all nested content
- **List**: List objects with filtering by type, published status, and search
- **Publish/Unpublish**: Control visibility of objects

### 1.4 Object Properties
- **Metadata**: Name, slug, title, description
- **Ownership**: User association for access control
- **Publishing**: Published/unpublished status
- **Versioning**: Historical versions of objects (planned)
- **Relationships**: Track dependencies between objects (planned)

---

## 2. Page Builder Features

### 2.1 Page Structure
- **Row-Based Layout**: Pages organized into rows with 1-4 columns
- **Flexible Column Widths**: Custom column width percentages (e.g., [33, 67])
- **Nested Components**: Components placed within rows at specific column positions
- **Component Positioning**: Components have position and columnIndex for ordering

### 2.2 Page Components
- **Text Components**: Heading, Paragraph, Text with styling
- **Media Components**: Image, Video with URL and metadata
- **Interactive Components**: Button, Link with actions
- **Layout Components**: Divider, Spacer for spacing
- **Content Components**: Quote, List, Code block
- **Dynamic Components**: Entity List, Entity Detail, Query Results, Forms, Charts

### 2.3 Component Properties
- **Content**: Component-specific content (text, URLs, data)
- **Styles**: Visual styling (colors, fonts, spacing, borders, backgrounds)
- **Configuration**: Responsive settings, animations, behavior
- **Validation**: Validation rules for form components
- **Widget Instances**: Components can be instances of reusable widgets

### 2.4 Page Metadata
- **SEO Settings**: Title, description, keywords
- **Menu Order**: Ordering for navigation menus
- **Layout Association**: Link to layout templates
- **Custom Metadata**: Additional metadata in JSON format

---

## 3. Widget System

### 3.1 Widget Features
- **Reusability**: Create once, use across multiple pages
- **Categories**: Organize widgets by category (navigation, content, etc.)
- **Widget Instances**: Pages can include widget instances with customization
- **Widget Structure**: Same row/component structure as pages

### 3.2 Widget Operations
- **Create Widgets**: Build reusable widget components
- **Use in Pages**: Insert widget instances into pages
- **Customize Instances**: Override widget properties per instance
- **Manage Widgets**: List, edit, delete widgets

---

## 4. Layout System

### 4.1 Layout Features
- **Template Creation**: Create layout templates
- **Page Association**: Pages can use layouts
- **Layout Structure**: Same row/component structure
- **Reusability**: Use layouts across multiple pages

---

## 5. Form Builder

### 5.1 Form Structure
- **Sections**: Organize fields into sections/tabs
- **Fields**: 22+ field types with validation
- **Multi-Step**: Support for multi-step forms with tabs
- **Repeatable Sections**: Sections that can be repeated

### 5.2 Field Types
- **Text**: Text, Email, Phone, URL, Password, Textarea, Rich Text
- **Number**: Number, Range, Rating
- **Date/Time**: Date, Time, Datetime
- **Selection**: Select, Multi-select, Radio, Checkbox
- **File**: File Upload, Image Upload
- **Advanced**: Color, Signature, Hidden

### 5.3 Form Features
- **Validation Rules**: Min/max, patterns, custom messages, required fields
- **Conditional Logic**: Show/hide fields based on other field values
- **Form Settings**: Submit button text, success message, redirect URL
- **Submission Management**: Multiple submissions allowed/restricted
- **Authentication**: Require authentication for form submission
- **Export**: Export submissions to CSV/JSON

### 5.4 Form Metadata
- **Submit Configuration**: Button text, success message
- **Redirect Settings**: URL to redirect after submission
- **Submission Rules**: Allow multiple submissions, require auth
- **Form Fields**: Array of field definitions with validation

---

## 6. Query Builder

### 6.1 Query Structure
- **Query Type**: Flat queries (single entity) or joined queries
- **Primary Entity**: Main entity for the query
- **Joins**: Multiple entity joins with join types (inner, left, right)
- **Fields**: Selected fields from entities with optional aggregation
- **Conditions**: Filter conditions with operators (equals, contains, etc.)
- **Settings**: Grouping, sorting, limits, display style

### 6.2 Query Features
- **Multi-Entity Joins**: Join multiple entities in a single query
- **Field Selection**: Choose which fields to include
- **Filtering**: Apply conditions to filter results
- **Sorting**: Sort by field and order
- **Grouping**: Group results by fields
- **Aggregation**: Apply aggregations to fields
- **Display Options**: Table, list, or custom display styles
- **Row Limits**: Limit number of results returned

---

## 7. Entity Management

### 7.1 Entity Definition
- **Custom Entities**: Create custom database entities
- **Field Definitions**: Define fields with types and validation
- **Entity Records**: Create and manage records for entities
- **Field Types**: Text, number, date, boolean, longtext, image, URL

### 7.2 Entity Operations
- **Create Entities**: Define entity structure
- **Manage Fields**: Add, edit, remove entity fields
- **Create Records**: Add data records to entities
- **Manage Records**: Edit, delete, publish records
- **Field Validation**: Enforce field types and rules
- **Published Records**: Control visibility of records

### 7.3 Entity Views

#### 7.3.1 Saved Views
- **View Persistence**: Save view configurations for reuse
- **User-Specific Views**: Each user can have their own saved views per entity
- **Default Views**: Mark a view as default to auto-load
- **View Management**: Create, update, delete, and rename saved views
- **View Sharing**: Views are private to each user

#### 7.3.2 View Types
- **Table View**: Traditional table with columns and rows
- **Card View**: Card-based layout with customizable card design
- **Kanban View**: Kanban board grouped by a field
- **Gallery View**: Image gallery layout
- **List View**: List layout with customizable fields
- **Timeline View**: Timeline visualization based on date fields
- **Calendar View**: Calendar grid view
- **Gantt View**: Gantt chart for project management

#### 7.3.3 View Configuration
- **Visible Columns**: Show/hide specific fields in the view
- **Sorting**: Sort by any field in ascending or descending order
- **Filters**: Apply filters with operators (equals, contains, greater than, etc.)
- **View-Specific Settings**:
  - **Card Layout**: Configure title, subtitle, image, and display fields for cards
  - **Kanban Config**: Group by field and card layout
  - **Gallery Config**: Image field, title, and subtitle
  - **List Config**: Title, subtitle, and display fields
  - **Timeline Config**: Date field, title, and description
  - **Calendar Config**: Date field and title
  - **Gantt Config**: Start date, end date, title, group by, color by, dependencies, progress

#### 7.3.4 View Operations
- **Save View**: Save current view configuration with a name
- **Load View**: Load a saved view configuration
- **Update View**: Update an existing saved view
- **Delete View**: Remove a saved view
- **Set Default**: Mark a view as default for auto-loading
- **View Selector**: Dropdown to switch between saved views

---

## 8. API Collection Management

### 8.1 API Features
- **Collection Organization**: Organize API requests into collections and folders
- **Request Management**: Create, edit, test API requests
- **Request Types**: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- **Request Configuration**: Headers, body, parameters, authentication

### 8.2 Request Features
- **Body Types**: None, JSON, Form Data, x-www-form-urlencoded, Raw, Binary
- **Authentication**: Bearer token, Basic auth, API Key
- **Request Execution**: Execute requests via backend
- **Response Viewer**: View responses with syntax highlighting
- **Request History**: Track request execution history
- **Import/Export**: Import/export Postman collections

---

## 9. Authentication & Authorization

### 9.1 User Authentication
- **User Registration**: Email and password registration
- **Email Verification**: Verify email addresses
- **Login**: Email/password login with JWT tokens
- **Password Reset**: Reset forgotten passwords via email
- **Token Management**: Access tokens and refresh tokens
- **Session Management**: Token expiration and renewal

### 9.2 Access Control
- **User Ownership**: Objects belong to users
- **Published Content**: Published objects visible to all
- **Private Content**: Unpublished objects only visible to owner
- **Role-Based Access**: User roles (user, admin) for permissions

---

## 10. Real-Time Collaboration

### 10.1 Real-Time Features
- **Live Updates**: Real-time updates when objects are modified
- **Multi-User Editing**: Multiple users can edit simultaneously
- **Change Notifications**: Notifications when others make changes
- **Nested Component Updates**: Real-time updates for nested components
- **User Presence**: See who is viewing/editing objects

### 10.2 Collaboration Features
- **Room-Based**: Users subscribe to specific objects
- **Event Broadcasting**: Changes broadcast to all subscribers
- **Conflict Resolution**: Handle concurrent edits
- **Typing Indicators**: Show when users are typing (optional)
- **Cursor Positions**: Show cursor positions (optional)

---

## 11. File Storage

### 11.1 Storage Features
- **Multiple Providers**: Local, S3, Azure, Google Cloud Storage
- **File Upload**: Upload files with metadata
- **File Management**: Delete, copy, move files
- **URL Generation**: Generate public or signed URLs
- **File Metadata**: Store filename, size, type, MIME type
- **Image Processing**: Resize, crop, optimize images (planned)

### 11.2 Storage Operations
- **Upload Files**: Upload files to storage provider
- **Retrieve Files**: Get file URLs (public or signed)
- **Delete Files**: Remove files from storage
- **List Files**: List files with prefix filtering
- **File Existence**: Check if files exist

---

## 12. Search & Filtering

### 12.1 Search Capabilities
- **Text Search**: Search in titles and names
- **Type Filtering**: Filter by component type
- **Status Filtering**: Filter by published/unpublished
- **User Filtering**: Filter by owner (admin only)
- **Pagination**: Paginated results with configurable limits

---

## 13. Data Operations

### 13.1 CRUD Operations
- **Create**: Create new objects with complete data
- **Read**: Retrieve objects with full nested structure
- **Update**: Full update or partial update (JSON Patch)
- **Delete**: Delete objects and nested content

### 13.2 Batch Operations
- **Batch Updates**: Update multiple objects in one request
- **Bulk Operations**: Create, update, delete multiple items

### 13.3 Nested Operations
- **Add Nested Components**: Add components to rows within objects
- **Update Nested Components**: Update nested component properties
- **Delete Nested Components**: Remove nested components
- **Add Rows**: Add rows to objects
- **Update Rows**: Modify row properties (columns, widths, styles)
- **Delete Rows**: Remove rows from objects

---

## 14. Versioning & History

### 14.1 Version Features
- **Version History**: Store historical versions of objects
- **Version Numbers**: Sequential version numbering
- **Version Metadata**: Track who created each version and when
- **Version Retrieval**: Retrieve specific versions

---

## 15. API Capabilities

### 15.1 REST API
- **RESTful Design**: Standard REST endpoints
- **API Versioning**: Versioned API endpoints (/api/v1/)
- **Consistent Responses**: Standardized success/error responses
- **Pagination**: Paginated list endpoints
- **Authentication**: JWT-based authentication

### 15.2 API Endpoints
- **Components API**: Unified API for all object types
- **Authentication API**: Register, login, password reset
- **Files API**: Upload, retrieve, delete files
- **Queries API**: Execute queries and get results

---

## 16. Database Agnosticism

### 16.1 Database Support
- **PostgreSQL**: Full support with JSONB
- **MySQL**: Support with JSON type
- **SQLite**: Support with JSON text storage
- **Adapter Layer**: Abstract database operations

### 16.2 Database Features
- **Query Builder**: Database-agnostic query building
- **Transactions**: Transaction support across databases
- **JSON Queries**: Query JSON data across databases
- **Indexing**: Optimized indexes for performance

---

## 17. Performance Features

### 17.1 Optimization
- **Caching**: Cache frequently accessed objects
- **Lazy Loading**: Load nested data on demand
- **Pagination**: Limit result sets
- **Indexing**: Database indexes for fast queries
- **JSON Indexing**: Index JSON paths for fast searches

---

## 18. Developer Features

### 18.1 API Client
- **TypeScript Types**: Type-safe API client
- **React Hooks**: React Query hooks for data fetching
- **Error Handling**: Comprehensive error handling
- **Request/Response Interceptors**: Customize requests/responses

### 18.2 WebSocket Client
- **Real-Time Hooks**: React hooks for real-time updates
- **Event Handling**: Subscribe to object updates
- **Connection Management**: Automatic reconnection

---

## 19. Migration & Data Management

### 19.1 Migration Features
- **Data Extraction**: Extract data from existing systems
- **Data Transformation**: Transform to unified format
- **Data Import**: Import into new system
- **Validation**: Validate migrated data integrity
- **Rollback**: Rollback migration if needed

---

## 20. Security Features

### 20.1 Security
- **Password Hashing**: Bcrypt password hashing
- **JWT Tokens**: Secure token-based authentication
- **Access Control**: User-based access control
- **Input Validation**: Validate all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Sanitize user inputs

---

## User Stories Summary

### As a Content Creator:
- I can create pages with drag-and-drop components
- I can reuse widgets across multiple pages
- I can create forms with validation and conditional logic
- I can publish/unpublish content
- I can see real-time updates when collaborating
- I can create custom views for entity records
- I can save and reuse view configurations

### As a Developer:
- I can use a RESTful API to manage content
- I can work with any database (PostgreSQL, MySQL, SQLite)
- I can build queries with joins and conditions
- I can manage API collections
- I can integrate real-time updates
- I can create custom entities with flexible schemas

### As an Administrator:
- I can manage all users and content
- I can configure storage providers
- I can monitor system performance
- I can migrate data from other systems

---

## Functional Requirements Summary

1. **Unified Object Model**: Single table for all content types
2. **Complete Document Storage**: All nested data in JSON
3. **Real-Time Collaboration**: Live updates and multi-user editing
4. **Database Agnostic**: Support multiple database types
5. **Flexible Storage**: Multiple file storage providers
6. **Comprehensive API**: RESTful API with versioning
7. **Rich Components**: 20+ component types
8. **Form Builder**: Advanced forms with validation
9. **Query Builder**: Visual query builder with joins
10. **Entity Management**: Custom entities and records
11. **Entity Views**: 8 view types with saved configurations
12. **Versioning**: Historical versions of objects
13. **Search & Filter**: Advanced search capabilities
14. **Authentication**: JWT-based auth with email verification
15. **Access Control**: User-based permissions
16. **Performance**: Caching, indexing, optimization
17. **API Collections**: Postman-like API testing
18. **Template System**: Reusable templates

---

## Feature Matrix

| Feature | Pages | Widgets | Layouts | Forms | Queries | Entities | API Collections | Templates |
|---------|-------|---------|---------|-------|---------|----------|-----------------|-----------|
| Create | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Publish | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Versioning | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Real-time | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Nested Components | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Views | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## Future Enhancements

### Planned Features
- **Mobile/Tablet Preview**: Preview pages on different devices
- **Advanced Styling**: More styling options for components
- **Responsive Design Controls**: Better responsive design tools
- **Component Variants**: Multiple variants for components
- **Section Templates**: Reusable section templates
- **Image Processing**: Advanced image manipulation
- **Analytics**: Track page views and user interactions
- **Multi-language Support**: Internationalization
- **Workflow Automation**: Automated workflows and triggers

---

## Notes

This document focuses on functional requirements and capabilities. For implementation details, refer to the other plan documents in this directory:
- `01-database-schema-migration.md` - Database design
- `02-backend-architecture.md` - Backend structure
- `03-database-adapter-layer.md` - Database abstraction
- `04-api-routes-controllers.md` - API design
- `05-authentication-system.md` - Auth implementation
- `06-realtime-updates.md` - Real-time features
- `07-file-storage-service.md` - File storage
- `08-frontend-api-client.md` - Frontend integration
- `09-migration-scripts.md` - Data migration
- `10-testing-strategy.md` - Testing approach
- `11-deployment-strategy.md` - Deployment
- `12-implementation-phases.md` - Implementation roadmap

