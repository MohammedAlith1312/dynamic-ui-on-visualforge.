# Testing Strategy Plan

## Overview

This document outlines the testing approach for the migration, including unit tests, integration tests, and end-to-end tests.

## Testing Pyramid

1. **Unit Tests** (70%): Test individual functions and classes
2. **Integration Tests** (20%): Test component interactions
3. **E2E Tests** (10%): Test complete user flows

## Unit Tests

### Service Tests

```javascript
// tests/unit/services/ComponentService.test.js
const ComponentService = require('../../../src/services/ComponentService');
const { getDatabase } = require('../../../src/config/database');

describe('ComponentService', () => {
  let service;
  let db;

  beforeAll(async () => {
    db = await getDatabase();
    service = new ComponentService(db);
  });

  describe('create', () => {
    it('should create a component', async () => {
      const component = await service.create({
        entityType: 'page',
        entityId: 'page-123',
        componentType: 'heading',
        data: { content: { text: 'Test' } },
        userId: 'user-123'
      });

      expect(component.id).toBeDefined();
      expect(component.component_type).toBe('heading');
    });

    it('should throw error for invalid entity', async () => {
      await expect(
        service.create({
          entityType: 'page',
          entityId: 'invalid',
          componentType: 'heading',
          data: {},
          userId: 'user-123'
        })
      ).rejects.toThrow();
    });
  });
});
```

### Controller Tests

```javascript
// tests/unit/controllers/ComponentController.test.js
const ComponentController = require('../../../src/controllers/ComponentController');
const ComponentService = require('../../../src/services/ComponentService');

describe('ComponentController', () => {
  let controller;
  let mockService;

  beforeEach(() => {
    mockService = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    controller = new ComponentController(mockService);
  });

  it('should create component', async () => {
    const req = {
      body: { entityType: 'page', entityId: 'page-123', componentType: 'heading', data: {} },
      user: { id: 'user-123' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockService.create.mockResolvedValue({ id: 'comp-123' });

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 'comp-123' }
    });
  });
});
```

## Integration Tests

### API Endpoint Tests

```javascript
// tests/integration/api/components.test.js
const request = require('supertest');
const app = require('../../../src/app');
const { getDatabase } = require('../../../src/config/database');

describe('Components API', () => {
  let token;
  let db;

  beforeAll(async () => {
    db = await getDatabase();
    // Create test user and get token
    token = await getTestToken();
  });

  describe('POST /api/v1/components', () => {
    it('should create a component', async () => {
      const response = await request(app)
        .post('/api/v1/components')
        .set('Authorization', `Bearer ${token}`)
        .send({
          entityType: 'page',
          entityId: 'page-123',
          componentType: 'heading',
          data: { content: { text: 'Test' } }
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
    });
  });
});
```

### Database Adapter Tests

```javascript
// tests/integration/database/adapter.test.js
const { initializeDatabase } = require('../../../src/config/database');

describe('Database Adapter', () => {
  let db;

  beforeAll(async () => {
    db = await initializeDatabase();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('should insert and retrieve data', async () => {
    const data = {
      id: 'test-123',
      entity_type: 'page',
      entity_id: 'page-123',
      component_type: 'heading',
      data: JSON.stringify({ content: { text: 'Test' } })
    };

    await db.insert('components', data);
    const found = await db.findOne('components', { id: 'test-123' });

    expect(found).toBeDefined();
    expect(found.component_type).toBe('heading');
  });
});
```

## E2E Tests

```javascript
// tests/e2e/components.test.js
const { test, expect } = require('@playwright/test');

test.describe('Component Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('should create a component', async ({ page }) => {
    await page.goto('/admin/editor/page-123');
    await page.click('[data-testid="add-component"]');
    await page.click('[data-testid="component-heading"]');
    
    await page.fill('[name="text"]', 'Test Heading');
    await page.click('button:has-text("Save")');

    await expect(page.locator('text=Test Heading')).toBeVisible();
  });
});
```

## Test Data Setup

```javascript
// tests/helpers/setup.js
const { getDatabase } = require('../../src/config/database');

async function setupTestData() {
  const db = await getDatabase();

  // Create test user
  await db.insert('users', {
    id: 'test-user-123',
    email: 'test@example.com',
    password_hash: 'hashed-password',
    email_verified: true
  });

  // Create test entity
  await db.insert('entities', {
    id: 'test-page-123',
    entity_type: 'page',
    name: 'test-page',
    slug: 'test-page',
    user_id: 'test-user-123',
    title: 'Test Page',
    data: JSON.stringify({}),
    is_published: false
  });
}

async function cleanupTestData() {
  const db = await getDatabase();
  await db.query('DELETE FROM components WHERE id LIKE ?', ['test-%']);
  await db.query('DELETE FROM entities WHERE id LIKE ?', ['test-%']);
  await db.query('DELETE FROM users WHERE id LIKE ?', ['test-%']);
}

module.exports = { setupTestData, cleanupTestData };
```

## Performance Tests

```javascript
// tests/performance/components.test.js
const { performance } = require('perf_hooks');
const ComponentService = require('../../src/services/ComponentService');

describe('Component Service Performance', () => {
  it('should handle bulk inserts efficiently', async () => {
    const start = performance.now();
    
    const components = Array.from({ length: 1000 }, (_, i) => ({
      entityType: 'page',
      entityId: 'page-123',
      componentType: 'heading',
      data: { content: { text: `Heading ${i}` } }
    }));

    await service.batchCreate(components);
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
  });
});
```

## Test Coverage Goals

- **Services**: 80%+ coverage
- **Controllers**: 70%+ coverage
- **Models**: 90%+ coverage
- **Middleware**: 80%+ coverage
- **Overall**: 75%+ coverage

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:coverage
```

