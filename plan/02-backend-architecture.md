# Backend Architecture Plan

## Overview

This document outlines the Node.js backend architecture for the Visual Forge Hub platform. The backend will be built with Express.js (or Fastify), following a layered architecture pattern with clear separation of concerns.

## Technology Stack

### Core Framework
- **Express.js** (or Fastify) - Web framework
- **TypeScript** - Type safety
- **Node.js** 18+ - Runtime

### Key Dependencies
- **express** / **fastify** - Web framework
- **cors** - CORS handling
- **helmet** - Security headers
- **compression** - Response compression
- **express-validator** / **zod** - Request validation
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **dotenv** - Environment variables
- **winston** - Logging
- **socket.io** - WebSocket support
- **multer** - File upload handling

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   ├── storage.js           # Storage configuration
│   │   ├── cache.js             # Cache configuration
│   │   ├── env.js               # Environment validation
│   │   └── logger.js             # Logger configuration
│   │
│   ├── controllers/
│   │   ├── ComponentController.js
│   │   ├── EntityController.js
│   │   ├── AuthController.js
│   │   ├── FileController.js
│   │   └── QueryController.js
│   │
│   ├── services/
│   │   ├── ComponentService.js
│   │   ├── EntityService.js
│   │   ├── AuthService.js
│   │   ├── FileService.js
│   │   ├── QueryService.js
│   │   └── CacheService.js
│   │
│   ├── models/
│   │   ├── Component.js
│   │   ├── Entity.js
│   │   ├── User.js
│   │   └── File.js
│   │
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── validation.js        # Request validation
│   │   ├── errorHandler.js      # Error handling
│   │   ├── logger.js            # Request logging
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── permissions.js       # RBAC middleware
│   │
│   ├── routes/
│   │   ├── index.js             # Route aggregator
│   │   ├── components.js
│   │   ├── entities.js
│   │   ├── auth.js
│   │   ├── files.js
│   │   └── queries.js
│   │
│   ├── utils/
│   │   ├── errors.js            # Custom error classes
│   │   ├── responses.js         # Response helpers
│   │   ├── validators.js        # Validation helpers
│   │   └── uuid.js              # UUID generation
│   │
│   ├── websocket/
│   │   ├── server.js            # WebSocket server setup
│   │   ├── handlers.js           # Event handlers
│   │   └── rooms.js              # Room management
│   │
│   └── app.js                    # Express app setup
│   └── server.js                 # Server entry point
│
├── migrations/
│   ├── 001_create_tables.js
│   ├── 002_create_indexes.js
│   └── ...
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture Layers

### 1. Controllers Layer

Controllers handle HTTP requests and responses. They should be thin and delegate business logic to services.

**Example: ComponentController.js**

```javascript
class ComponentController {
  constructor(componentService) {
    this.componentService = componentService;
  }

  async create(req, res, next) {
    try {
      const { componentType, name, slug, title, description, data } = req.body;
      const userId = req.user.id;

      const component = await this.componentService.create({
        componentType,
        name,
        slug,
        title,
        description,
        data,
        userId
      });

      res.status(201).json({
        success: true,
        data: component
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const component = await this.componentService.getById(id, req.user.id);
      
      res.json({
        success: true,
        data: component
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const component = await this.componentService.update(id, updates, req.user.id);
      
      res.json({
        success: true,
        data: component
      });
    } catch (error) {
      next(error);
    }
  }

  async patch(req, res, next) {
    try {
      const { id } = req.params;
      const { patch } = req.body; // JSON Patch operations
      const component = await this.componentService.patch(id, patch, req.user.id);
      
      res.json({
        success: true,
        data: component
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await this.componentService.delete(id, req.user.id);
      
      res.json({
        success: true,
        message: 'Component deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const { componentType, isPublished, page = 1, limit = 50 } = req.query;
      const result = await this.componentService.list({
        componentType,
        userId: req.user.id,
        isPublished: isPublished === 'true',
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // Nested component operations
  async addNestedComponent(req, res, next) {
    try {
      const { id, rowId } = req.params;
      const nestedComponent = req.body;
      const component = await this.componentService.addNestedComponent(
        id,
        rowId,
        nestedComponent,
        req.user.id
      );
      
      res.json({
        success: true,
        data: component
      });
    } catch (error) {
      next(error);
    }
  }

  async updateNestedComponent(req, res, next) {
    try {
      const { id, rowId, nestedComponentId } = req.params;
      const updates = req.body;
      const component = await this.componentService.updateNestedComponent(
        id,
        rowId,
        nestedComponentId,
        updates,
        req.user.id
      );
      
      res.json({
        success: true,
        data: component
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNestedComponent(req, res, next) {
    try {
      const { id, rowId, nestedComponentId } = req.params;
      const component = await this.componentService.deleteNestedComponent(
        id,
        rowId,
        nestedComponentId,
        req.user.id
      );
      
      res.json({
        success: true,
        data: component
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ComponentController;
```

### 2. Services Layer

Services contain business logic and interact with the database through models.

**Example: ComponentService.js**

```javascript
const Component = require('../models/Component');
const CacheService = require('./CacheService');
const jsonpatch = require('fast-json-patch');

class ComponentService {
  constructor(database, cacheService) {
    this.db = database;
    this.cache = cacheService;
  }

  async create({ componentType, name, slug, title, description, data, userId }) {
    // Validate component data structure
    this.validateComponentData(componentType, data);

    // Generate slug if not provided
    if (!slug) {
      slug = this.generateSlug(name || title);
    }

    // Check for duplicate name
    const existing = await Component.findByName(componentType, name, userId, this.db);
    if (existing) {
      throw new Error('Component with this name already exists');
    }

    // Create component
    const component = await Component.create({
      component_type: componentType,
      name,
      slug,
      user_id: userId,
      title,
      description,
      data: JSON.stringify(data),
      is_published: false,
      metadata: JSON.stringify({})
    }, this.db);

    // Invalidate cache
    await this.cache.invalidate(`components:${componentType}:${userId}`);

    return component;
  }

  async getById(id, userId) {
    const cacheKey = `component:${id}`;
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      // Verify access
      if (cached.user_id !== userId && !cached.is_published) {
        throw new Error('Access denied');
      }
      return cached;
    }

    const component = await Component.findById(id, this.db);
    
    if (!component) {
      throw new Error('Component not found');
    }

    // Verify access
    if (component.user_id !== userId && !component.is_published) {
      throw new Error('Access denied');
    }

    // Parse JSON data
    component.data = JSON.parse(component.data || '{}');

    // Cache result
    await this.cache.set(cacheKey, component, 300);

    return component;
  }

  async update(id, updates, userId) {
    const component = await this.getById(id, userId);
    
    // If updating data, merge with existing
    if (updates.data) {
      const existingData = component.data;
      updates.data = { ...existingData, ...updates.data };
      this.validateComponentData(component.component_type, updates.data);
    }

    // Update component
    const updated = await Component.update(id, {
      ...updates,
      data: updates.data ? JSON.stringify(updates.data) : undefined,
      updated_at: new Date().toISOString()
    }, this.db);

    // Invalidate cache
    await this.cache.invalidate(`component:${id}`);
    await this.cache.invalidate(`components:${component.component_type}:${userId}`);

    return updated;
  }

  // Update using JSON Patch for efficient partial updates
  async patch(id, patchOperations, userId) {
    const component = await this.getById(id, userId);
    
    // Apply JSON Patch
    const patchedData = jsonpatch.applyPatch(component.data, patchOperations).newDocument;
    
    // Validate patched data
    this.validateComponentData(component.component_type, patchedData);

    // Update component
    const updated = await Component.update(id, {
      data: JSON.stringify(patchedData),
      updated_at: new Date().toISOString()
    }, this.db);

    // Invalidate cache
    await this.cache.invalidate(`component:${id}`);
    await this.cache.invalidate(`components:${component.component_type}:${userId}`);

    return updated;
  }

  // Add nested component to a row
  async addNestedComponent(componentId, rowId, nestedComponent, userId) {
    const component = await this.getById(componentId, userId);
    const data = component.data;

    // Find the row
    const rows = data.rows || [];
    const row = rows.find(r => r.id === rowId);
    if (!row) {
      throw new Error('Row not found');
    }

    // Add component to row
    row.components = row.components || [];
    nestedComponent.id = this.generateId();
    nestedComponent.position = nestedComponent.position ?? row.components.length;
    nestedComponent.columnIndex = nestedComponent.columnIndex ?? 0;
    row.components.push(nestedComponent);

    // Update component
    return await this.update(componentId, { data }, userId);
  }

  async delete(id, userId) {
    const component = await this.getById(id, userId);
    await Component.delete(id, this.db);

    // Invalidate cache
    await this.cache.invalidate(`component:${id}`);
    await this.cache.invalidate(`components:${component.component_type}:${userId}`);
  }

  async list({ componentType, userId, isPublished, page, limit }) {
    const cacheKey = `components:${componentType}:${userId}:${isPublished}:${page}:${limit}`;
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const result = await Component.list({
      componentType,
      userId,
      isPublished,
      page,
      limit
    }, this.db);

    // Parse JSON data for each component
    result.items = result.items.map(item => ({
      ...item,
      data: JSON.parse(item.data || '{}')
    }));

    // Cache result
    await this.cache.set(cacheKey, result, 300);

    return result;
  }

  async batchUpdate(operations, userId) {
    // Validate all operations
    for (const op of operations) {
      await this.getById(op.id, userId);
    }

    // Execute in transaction
    return await this.db.transaction(async (tx) => {
      const results = [];
      for (const op of operations) {
        const result = await Component.update(op.id, op.data, tx);
        results.push(result);
      }
      return results;
    });
  }

  validateComponentData(componentType, data) {
    // Type-specific validation
    switch (componentType) {
      case 'page':
        this.validatePageData(data);
        break;
      case 'widget':
        this.validateWidgetData(data);
        break;
      case 'form':
        this.validateFormData(data);
        break;
      // ... other types
    }
  }

  validatePageData(data) {
    if (!data.rows || !Array.isArray(data.rows)) {
      throw new Error('Page data must have rows array');
    }
    // Additional validation...
  }

  generateSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = ComponentService;
```

### 3. Models Layer

Models abstract database operations and provide a clean interface.

**Example: Component.js**

```javascript
class Component {
  static async create(data, db) {
    const id = generateUUID();
    const now = new Date().toISOString();
    
    const component = {
      id,
      ...data,
      created_at: now,
      updated_at: now
    };

    await db.insert('components', component);
    return component;
  }

  static async findById(id, db) {
    return await db.findOne('components', { id });
  }

  static async findByName(componentType, name, userId, db) {
    return await db.findOne('components', {
      component_type: componentType,
      name,
      user_id: userId
    });
  }

  static async findBySlug(slug, db) {
    return await db.findOne('components', { slug });
  }

  static async update(id, updates, db) {
    updates.updated_at = new Date().toISOString();
    return await db.update('components', id, updates);
  }

  static async delete(id, db) {
    return await db.delete('components', id);
  }

  static async list(filters, db) {
    const query = db.queryBuilder('components');
    
    if (filters.componentType) {
      query.where('component_type', '=', filters.componentType);
    }
    
    if (filters.userId) {
      query.where('user_id', '=', filters.userId);
    }
    
    if (filters.isPublished !== undefined) {
      query.where('is_published', '=', filters.isPublished);
    }
    
    query.orderBy('created_at', 'DESC');
    query.paginate(filters.page, filters.limit);
    
    const result = await query.execute();
    
    return {
      items: result.rows || result,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: result.total || result.length
      }
    };
  }
}

module.exports = Component;
```

### 4. Middleware

#### Authentication Middleware

```javascript
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

module.exports = authenticate;
```

#### Validation Middleware

```javascript
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  next();
};

module.exports = validate;
```

#### Error Handler Middleware

```javascript
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Custom error handling
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
```

#### Rate Limiter Middleware

```javascript
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Different limiters for different endpoints
const apiLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
const authLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes

module.exports = { apiLimiter, authLimiter };
```

## Application Setup

### app.js

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./middleware/logger');
const routes = require('./routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
app.use(logger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', routes);

// Error handling (must be last)
app.use(errorHandler);

module.exports = app;
```

### server.js

```javascript
const app = require('./app');
const { initializeDatabase } = require('./config/database');
const { initializeWebSocket } = require('./websocket/server');
const logger = require('./config/logger');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info('Database connected');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    // Initialize WebSocket
    initializeWebSocket(server);
    logger.info('WebSocket server initialized');

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

## Environment Configuration

### .env.example

```env
# Server
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=visual_forge_hub
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Storage
STORAGE_PROVIDER=local
STORAGE_PATH=./uploads
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
AWS_REGION=

# Cache
REDIS_URL=redis://localhost:6379
CACHE_TTL=300

# Email (for verification, password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=noreply@example.com

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### config/env.js

```javascript
require('dotenv').config();
const Joi = require('joi');

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().required(),
  DB_TYPE: Joi.string().valid('postgresql', 'mysql', 'sqlite').required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  STORAGE_PROVIDER: Joi.string().valid('local', 's3', 'azure', 'gcs').default('local'),
  // ... other validations
}).unknown();

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = value;
```

## Logging Configuration

### config/logger.js

```javascript
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'visual-forge-hub' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log') 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
```

## Dependency Injection

Use a simple dependency injection pattern:

```javascript
// config/container.js
class Container {
  constructor() {
    this.services = {};
  }

  register(name, factory) {
    this.services[name] = factory;
  }

  get(name) {
    if (!this.services[name]) {
      throw new Error(`Service ${name} not found`);
    }
    return this.services[name](this);
  }
}

const container = new Container();

// Register services
container.register('database', () => require('./config/database'));
container.register('cache', () => require('./services/CacheService'));
container.register('componentService', (c) => 
  new (require('./services/ComponentService'))(c.get('database'), c.get('cache'))
);

module.exports = container;
```

## Error Handling Strategy

### Custom Error Classes

```javascript
// utils/errors.js
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError
};
```

## Response Format Standardization

### utils/responses.js

```javascript
const successResponse = (data, message = null) => ({
  success: true,
  data,
  ...(message && { message })
});

const errorResponse = (error, message = null) => ({
  success: false,
  error: message || error.message,
  ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
});

const paginatedResponse = (items, pagination) => ({
  success: true,
  data: items,
  pagination: {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: Math.ceil(pagination.total / pagination.limit)
  }
});

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};
```

## Testing Structure

### Unit Tests

```javascript
// tests/unit/services/ComponentService.test.js
const ComponentService = require('../../../src/services/ComponentService');

describe('ComponentService', () => {
  let service;
  let mockDb;
  let mockCache;

  beforeEach(() => {
    mockDb = {
      insert: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      invalidate: jest.fn()
    };
    service = new ComponentService(mockDb, mockCache);
  });

  describe('create', () => {
    it('should create a component', async () => {
      // Test implementation
    });
  });
});
```

## Best Practices

1. **Separation of Concerns**: Keep controllers thin, services contain business logic
2. **Error Handling**: Use custom error classes and centralized error handler
3. **Validation**: Validate at the route level using express-validator
4. **Logging**: Log all errors and important operations
5. **Security**: Use helmet, CORS, rate limiting
6. **Performance**: Implement caching, compression, connection pooling
7. **Testing**: Write unit tests for services, integration tests for APIs
8. **Documentation**: Use JSDoc for code documentation
9. **Type Safety**: Use TypeScript for better type safety
10. **Environment Variables**: Never commit secrets, use .env files

