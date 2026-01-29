# API Routes and Controllers Plan

## Overview

This document defines the RESTful API design for the Visual Forge Hub backend. All endpoints follow REST conventions with consistent response formats, error handling, and versioning.

## API Versioning

All endpoints are versioned: `/api/v1/`

Future versions will use `/api/v2/`, etc.

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

## Authentication

All endpoints (except auth endpoints) require JWT authentication:

```
Authorization: Bearer <token>
```

## Components/Objects API

All objects (pages, widgets, layouts, forms, queries, etc.) are accessed through a unified Components API. Each object is stored as a complete document with all nested data.

### List Components/Objects

```
GET /api/v1/components
```

**Query Parameters:**
- `componentType` (optional): Filter by type (page, widget, layout, form, query, etc.)
- `isPublished` (optional): Filter by published status (true/false)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `search` (optional): Search in title/name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "comp-123",
      "componentType": "page",
      "name": "home-page",
      "slug": "home",
      "title": "Home Page",
      "description": "Welcome page",
      "data": {
        "meta": { ... },
        "rows": [ ... ]
      },
      "isPublished": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  }
}
```

### Get Component/Object

```
GET /api/v1/components/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "comp-123",
    "componentType": "page",
    "name": "home-page",
    "slug": "home",
    "title": "Home Page",
    "description": "Welcome page",
    "data": {
      "meta": {
        "menuOrder": 0,
        "layoutId": null,
        "seo": { ... }
      },
      "rows": [
        {
          "id": "row-1",
          "position": 0,
          "columns": 2,
          "columnWidths": [50, 50],
          "styles": { ... },
          "components": [
            {
              "id": "comp-1",
              "componentType": "heading",
              "position": 0,
              "columnIndex": 0,
              "data": {
                "content": { ... },
                "styles": { ... }
              }
            }
          ]
        }
      ]
    },
    "isPublished": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Create Component/Object

```
POST /api/v1/components
```

**Request Body:**
```json
{
  "componentType": "page",
  "name": "home-page",
  "slug": "home",
  "title": "Home Page",
  "description": "Welcome page",
  "data": {
    "meta": {
      "menuOrder": 0,
      "seo": {
        "title": "Home Page",
        "description": "Welcome"
      }
    },
    "rows": [
      {
        "id": "row-1",
        "position": 0,
        "columns": 2,
        "columnWidths": [50, 50],
        "styles": {},
        "components": []
      }
    ]
  }
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "id": "comp-123",
    "componentType": "page",
    ...
  }
}
```

### Update Component/Object

```
PUT /api/v1/components/:id
```

**Request Body:** (all fields optional, merges with existing data)

```json
{
  "title": "Updated Title",
  "data": {
    "meta": {
      "menuOrder": 1
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "comp-123",
    ...
  }
}
```

### Partial Update (JSON Patch)

```
PATCH /api/v1/components/:id
```

**Request Body:** (JSON Patch format for efficient partial updates)

```json
{
  "patch": [
    {
      "op": "add",
      "path": "/rows/0/components/-",
      "value": {
        "id": "comp-new",
        "componentType": "heading",
        "position": 0,
        "columnIndex": 0,
        "data": {
          "content": { "text": "New Heading" }
        }
      }
    },
    {
      "op": "replace",
      "path": "/rows/0/components/0/data/content/text",
      "value": "Updated Text"
    },
    {
      "op": "remove",
      "path": "/rows/0/components/1"
    }
  ]
}
```

### Delete Component/Object

```
DELETE /api/v1/components/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Component deleted successfully"
}
```

### Publish/Unpublish Component

```
PATCH /api/v1/components/:id/publish
```

**Request Body:**
```json
{
  "isPublished": true
}
```

### Get Component by Slug

```
GET /api/v1/components/slug/:slug
```

**Response:** Same as Get Component by ID

## Nested Component Operations

### Add Nested Component to Row

```
POST /api/v1/components/:id/rows/:rowId/components
```

**Request Body:**
```json
{
  "componentType": "heading",
  "position": 0,
  "columnIndex": 0,
  "data": {
    "content": {
      "text": "Welcome",
      "level": 1
    },
    "styles": {
      "color": "#000000"
    }
  }
}
```

### Update Nested Component

```
PUT /api/v1/components/:id/rows/:rowId/components/:nestedComponentId
```

**Request Body:**
```json
{
  "data": {
    "content": {
      "text": "Updated Text"
    }
  }
}
```

### Delete Nested Component

```
DELETE /api/v1/components/:id/rows/:rowId/components/:nestedComponentId
```

## Row Operations (within Component)

### Add Row to Component

```
POST /api/v1/components/:id/rows
```

**Request Body:**
```json
{
  "position": 0,
  "columns": 2,
  "columnWidths": [50, 50],
  "styles": {
    "backgroundColor": "#ffffff"
  },
  "components": []
}
```

### Update Row

```
PUT /api/v1/components/:id/rows/:rowId
```

**Request Body:**
```json
{
  "columns": 3,
  "columnWidths": [33, 33, 34],
  "styles": { ... }
}
```

### Delete Row

```
DELETE /api/v1/components/:id/rows/:rowId
```

## Authentication API

### Register

```
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### Login

```
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Refresh Token

```
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

### Logout

```
POST /api/v1/auth/logout
```

### Verify Email

```
GET /api/v1/auth/verify-email?token=verification-token
```

### Request Password Reset

```
POST /api/v1/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Reset Password

```
POST /api/v1/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "newpassword"
}
```

## Files API

### Upload File

```
POST /api/v1/files/upload
```

**Content-Type:** multipart/form-data

**Form Data:**
- `file`: File to upload
- `folder` (optional): Folder path

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file-123",
    "filename": "image.jpg",
    "url": "https://cdn.example.com/files/image.jpg",
    "fileSize": 1024000,
    "mimeType": "image/jpeg"
  }
}
```

### Get File

```
GET /api/v1/files/:id
```

### Delete File

```
DELETE /api/v1/files/:id
```

### List Files

```
GET /api/v1/files?page=1&limit=50
```

## Queries API

### Execute Query

```
POST /api/v1/queries/:id/execute
```

**Request Body:**
```json
{
  "params": {
    "limit": 50
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "rowCount": 50,
  "executionTime": 150
}
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **File Upload**: 10 requests per hour per user

## Error Codes

- `VALIDATION_ERROR` (400): Request validation failed
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource conflict
- `INTERNAL_ERROR` (500): Server error

## Route Implementation

### routes/index.js

```javascript
const express = require('express');
const componentRoutes = require('./components');
const entityRoutes = require('./entities');
const authRoutes = require('./auth');
const fileRoutes = require('./files');
const rowRoutes = require('./rows');
const queryRoutes = require('./queries');

const router = express.Router();

router.use('/components', componentRoutes);
router.use('/auth', authRoutes);
router.use('/files', fileRoutes);
router.use('/queries', queryRoutes);

module.exports = router;
```

### routes/components.js

```javascript
const express = require('express');
const ComponentController = require('../controllers/ComponentController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { componentValidators } = require('../utils/validators');

const router = express.Router();
const controller = new ComponentController(
  require('../services/ComponentService')
);

// All routes require authentication
router.use(authenticate);

// Main component routes
router.get('/', 
  componentValidators.list,
  validate,
  controller.list.bind(controller)
);

router.get('/slug/:slug', controller.getBySlug.bind(controller));

router.get('/:id', controller.getById.bind(controller));

router.post('/',
  componentValidators.create,
  validate,
  controller.create.bind(controller)
);

router.put('/:id',
  componentValidators.update,
  validate,
  controller.update.bind(controller)
);

router.patch('/:id',
  componentValidators.patch,
  validate,
  controller.patch.bind(controller)
);

router.delete('/:id', controller.delete.bind(controller));

router.patch('/:id/publish',
  componentValidators.publish,
  validate,
  controller.publish.bind(controller)
);

// Nested component operations
router.post('/:id/rows/:rowId/components',
  componentValidators.addNestedComponent,
  validate,
  controller.addNestedComponent.bind(controller)
);

router.put('/:id/rows/:rowId/components/:nestedComponentId',
  componentValidators.updateNestedComponent,
  validate,
  controller.updateNestedComponent.bind(controller)
);

router.delete('/:id/rows/:rowId/components/:nestedComponentId',
  controller.deleteNestedComponent.bind(controller)
);

// Row operations
router.post('/:id/rows',
  componentValidators.addRow,
  validate,
  controller.addRow.bind(controller)
);

router.put('/:id/rows/:rowId',
  componentValidators.updateRow,
  validate,
  controller.updateRow.bind(controller)
);

router.delete('/:id/rows/:rowId',
  controller.deleteRow.bind(controller)
);

module.exports = router;
```

## Validation

### utils/validators.js

```javascript
const { body, query, param } = require('express-validator');

const componentValidators = {
  list: [
    query('componentType').optional().isIn(['page', 'widget', 'layout', 'form', 'query', 'api_collection', 'entity', 'template']),
    query('isPublished').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString()
  ],
  
  create: [
    body('componentType').notEmpty().isIn(['page', 'widget', 'layout', 'form', 'query', 'api_collection', 'entity', 'template']),
    body('name').notEmpty().isString(),
    body('slug').optional().isString(),
    body('title').notEmpty().isString(),
    body('description').optional().isString(),
    body('data').notEmpty().isObject()
  ],
  
  update: [
    param('id').isUUID(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('data').optional().isObject(),
    body('isPublished').optional().isBoolean()
  ],
  
  patch: [
    param('id').isUUID(),
    body('patch').isArray(),
    body('patch.*.op').isIn(['add', 'remove', 'replace', 'move', 'copy', 'test']),
    body('patch.*.path').isString(),
    body('patch.*.value').optional()
  ],
  
  publish: [
    param('id').isUUID(),
    body('isPublished').isBoolean()
  ],
  
  addNestedComponent: [
    param('id').isUUID(),
    param('rowId').isString(),
    body('componentType').notEmpty().isString(),
    body('data').notEmpty().isObject(),
    body('position').optional().isInt({ min: 0 }),
    body('columnIndex').optional().isInt({ min: 0 })
  ],
  
  updateNestedComponent: [
    param('id').isUUID(),
    param('rowId').isString(),
    param('nestedComponentId').isString(),
    body('data').optional().isObject()
  ],
  
  addRow: [
    param('id').isUUID(),
    body('position').isInt({ min: 0 }),
    body('columns').isInt({ min: 1, max: 4 }),
    body('columnWidths').optional().isArray(),
    body('styles').optional().isObject(),
    body('components').optional().isArray()
  ],
  
  updateRow: [
    param('id').isUUID(),
    param('rowId').isString(),
    body('columns').optional().isInt({ min: 1, max: 4 }),
    body('columnWidths').optional().isArray(),
    body('styles').optional().isObject()
  ]
};

module.exports = {
  componentValidators
};
```

## OpenAPI Documentation

Use Swagger/OpenAPI for API documentation:

```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Visual Forge Hub API',
      version: '1.0.0',
      description: 'API documentation for Visual Forge Hub'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

