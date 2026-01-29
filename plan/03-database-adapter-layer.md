# Database Adapter Layer Plan

## Overview

This document describes the database-agnostic abstraction layer that allows the application to work with multiple database systems (PostgreSQL, MySQL, SQLite) without changing application code.

## Design Principles

1. **Unified Interface**: All database operations go through a common interface
2. **Database Agnostic**: Application code doesn't know which database is being used
3. **Query Builder**: Abstract SQL generation for different databases
4. **Transaction Support**: Consistent transaction handling across databases
5. **Connection Pooling**: Efficient connection management
6. **Migration System**: Database-agnostic migration support

## Architecture

### Base Adapter Interface

```javascript
// src/config/database/BaseAdapter.js
class BaseAdapter {
  constructor(config) {
    this.config = config;
    this.pool = null;
  }

  // Connection management
  async connect() {
    throw new Error('connect() must be implemented');
  }

  async disconnect() {
    throw new Error('disconnect() must be implemented');
  }

  // Basic CRUD operations
  async insert(table, data) {
    throw new Error('insert() must be implemented');
  }

  async findOne(table, conditions) {
    throw new Error('findOne() must be implemented');
  }

  async findMany(table, conditions, options = {}) {
    throw new Error('findMany() must be implemented');
  }

  async update(table, id, data) {
    throw new Error('update() must be implemented');
  }

  async delete(table, id) {
    throw new Error('delete() must be implemented');
  }

  // Query execution
  async query(sql, params = []) {
    throw new Error('query() must be implemented');
  }

  // Transaction support
  async transaction(callback) {
    throw new Error('transaction() must be implemented');
  }

  // Query builder
  queryBuilder(table) {
    throw new Error('queryBuilder() must be implemented');
  }

  // Utility methods
  escapeIdentifier(identifier) {
    throw new Error('escapeIdentifier() must be implemented');
  }

  escapeValue(value) {
    throw new Error('escapeValue() must be implemented');
  }
}

module.exports = BaseAdapter;
```

## PostgreSQL Adapter

```javascript
// src/config/database/PostgreSQLAdapter.js
const { Pool } = require('pg');
const BaseAdapter = require('./BaseAdapter');
const PostgreSQLQueryBuilder = require('./queryBuilders/PostgreSQLQueryBuilder');

class PostgreSQLAdapter extends BaseAdapter {
  async connect() {
    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      max: this.config.poolSize || 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });

    // Test connection
    const client = await this.pool.connect();
    client.release();
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const columns = keys.map(k => this.escapeIdentifier(k)).join(', ');

    const sql = `INSERT INTO ${this.escapeIdentifier(table)} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await this.query(sql, values);
    return result.rows[0];
  }

  async findOne(table, conditions) {
    const builder = this.queryBuilder(table);
    Object.entries(conditions).forEach(([key, value]) => {
      builder.where(key, '=', value);
    });
    builder.limit(1);
    
    const result = await builder.execute();
    return result.rows[0] || null;
  }

  async findMany(table, conditions, options = {}) {
    const builder = this.queryBuilder(table);
    
    Object.entries(conditions).forEach(([key, value]) => {
      builder.where(key, '=', value);
    });

    if (options.orderBy) {
      builder.orderBy(options.orderBy.field, options.orderBy.direction || 'ASC');
    }

    if (options.limit) {
      builder.limit(options.limit);
    }

    if (options.offset) {
      builder.offset(options.offset);
    }

    return await builder.execute();
  }

  async update(table, id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => 
      `${this.escapeIdentifier(key)} = $${i + 1}`
    ).join(', ');

    const sql = `UPDATE ${this.escapeIdentifier(table)} SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`;
    const result = await this.query(sql, [...values, id]);
    return result.rows[0];
  }

  async delete(table, id) {
    const sql = `DELETE FROM ${this.escapeIdentifier(table)} WHERE id = $1 RETURNING *`;
    const result = await this.query(sql, [id]);
    return result.rows[0];
  }

  async query(sql, params = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result;
    } finally {
      client.release();
    }
  }

  async transaction(callback) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  queryBuilder(table) {
    return new PostgreSQLQueryBuilder(table, this);
  }

  escapeIdentifier(identifier) {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  escapeValue(value) {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'object') {
      return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
    }
    return `'${String(value).replace(/'/g, "''")}'`;
  }
}

module.exports = PostgreSQLAdapter;
```

## MySQL Adapter

```javascript
// src/config/database/MySQLAdapter.js
const mysql = require('mysql2/promise');
const BaseAdapter = require('./BaseAdapter');
const MySQLQueryBuilder = require('./queryBuilders/MySQLQueryBuilder');

class MySQLAdapter extends BaseAdapter {
  async connect() {
    this.pool = mysql.createPool({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      waitForConnections: true,
      connectionLimit: this.config.poolSize || 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await this.pool.getConnection();
    connection.release();
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.map(k => this.escapeIdentifier(k)).join(', ');

    const sql = `INSERT INTO ${this.escapeIdentifier(table)} (${columns}) VALUES (${placeholders})`;
    const [result] = await this.query(sql, values);
    return { id: result.insertId, ...data };
  }

  async findOne(table, conditions) {
    const builder = this.queryBuilder(table);
    Object.entries(conditions).forEach(([key, value]) => {
      builder.where(key, '=', value);
    });
    builder.limit(1);
    
    const [rows] = await builder.execute();
    return rows[0] || null;
  }

  async findMany(table, conditions, options = {}) {
    const builder = this.queryBuilder(table);
    
    Object.entries(conditions).forEach(([key, value]) => {
      builder.where(key, '=', value);
    });

    if (options.orderBy) {
      builder.orderBy(options.orderBy.field, options.orderBy.direction || 'ASC');
    }

    if (options.limit) {
      builder.limit(options.limit);
    }

    if (options.offset) {
      builder.offset(options.offset);
    }

    const [rows] = await builder.execute();
    return rows;
  }

  async update(table, id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => 
      `${this.escapeIdentifier(key)} = ?`
    ).join(', ');

    const sql = `UPDATE ${this.escapeIdentifier(table)} SET ${setClause} WHERE id = ?`;
    await this.query(sql, [...values, id]);
    return await this.findOne(table, { id });
  }

  async delete(table, id) {
    const sql = `DELETE FROM ${this.escapeIdentifier(table)} WHERE id = ?`;
    await this.query(sql, [id]);
    return { id };
  }

  async query(sql, params = []) {
    return await this.pool.execute(sql, params);
  }

  async transaction(callback) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  queryBuilder(table) {
    return new MySQLQueryBuilder(table, this);
  }

  escapeIdentifier(identifier) {
    return `\`${identifier.replace(/`/g, '``')}\``;
  }

  escapeValue(value) {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'object') {
      return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    }
    return `'${String(value).replace(/'/g, "''")}'`;
  }
}

module.exports = MySQLAdapter;
```

## SQLite Adapter

```javascript
// src/config/database/SQLiteAdapter.js
const Database = require('better-sqlite3');
const BaseAdapter = require('./BaseAdapter');
const SQLiteQueryBuilder = require('./queryBuilders/SQLiteQueryBuilder');

class SQLiteAdapter extends BaseAdapter {
  async connect() {
    this.pool = new Database(this.config.database, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : null
    });
    
    // Enable foreign keys
    this.pool.pragma('foreign_keys = ON');
  }

  async disconnect() {
    if (this.pool) {
      this.pool.close();
    }
  }

  async insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.map(k => this.escapeIdentifier(k)).join(', ');

    const sql = `INSERT INTO ${this.escapeIdentifier(table)} (${columns}) VALUES (${placeholders})`;
    const stmt = this.pool.prepare(sql);
    const result = stmt.run(...values);
    
    return { id: result.lastInsertRowid.toString(), ...data };
  }

  async findOne(table, conditions) {
    const builder = this.queryBuilder(table);
    Object.entries(conditions).forEach(([key, value]) => {
      builder.where(key, '=', value);
    });
    builder.limit(1);
    
    const result = builder.execute();
    return result[0] || null;
  }

  async findMany(table, conditions, options = {}) {
    const builder = this.queryBuilder(table);
    
    Object.entries(conditions).forEach(([key, value]) => {
      builder.where(key, '=', value);
    });

    if (options.orderBy) {
      builder.orderBy(options.orderBy.field, options.orderBy.direction || 'ASC');
    }

    if (options.limit) {
      builder.limit(options.limit);
    }

    if (options.offset) {
      builder.offset(options.offset);
    }

    return builder.execute();
  }

  async update(table, id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => 
      `${this.escapeIdentifier(key)} = ?`
    ).join(', ');

    const sql = `UPDATE ${this.escapeIdentifier(table)} SET ${setClause} WHERE id = ?`;
    const stmt = this.pool.prepare(sql);
    stmt.run(...values, id);
    return await this.findOne(table, { id });
  }

  async delete(table, id) {
    const sql = `DELETE FROM ${this.escapeIdentifier(table)} WHERE id = ?`;
    const stmt = this.pool.prepare(sql);
    stmt.run(id);
    return { id };
  }

  async query(sql, params = []) {
    const stmt = this.pool.prepare(sql);
    return stmt.all(...params);
  }

  async transaction(callback) {
    const transaction = this.pool.transaction(callback);
    return transaction();
  }

  queryBuilder(table) {
    return new SQLiteQueryBuilder(table, this);
  }

  escapeIdentifier(identifier) {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  escapeValue(value) {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'object') {
      return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    }
    return `'${String(value).replace(/'/g, "''")}'`;
  }
}

module.exports = SQLiteAdapter;
```

## Query Builder

### Base Query Builder

```javascript
// src/config/database/queryBuilders/BaseQueryBuilder.js
class BaseQueryBuilder {
  constructor(table, adapter) {
    this.table = table;
    this.adapter = adapter;
    this.wheres = [];
    this.orderBys = [];
    this.limitValue = null;
    this.offsetValue = null;
    this.selectFields = ['*'];
  }

  select(fields) {
    this.selectFields = Array.isArray(fields) ? fields : [fields];
    return this;
  }

  where(column, operator, value) {
    this.wheres.push({ column, operator, value });
    return this;
  }

  whereIn(column, values) {
    this.wheres.push({ column, operator: 'IN', value: values });
    return this;
  }

  orderBy(column, direction = 'ASC') {
    this.orderBys.push({ column, direction });
    return this;
  }

  limit(count) {
    this.limitValue = count;
    return this;
  }

  offset(count) {
    this.offsetValue = count;
    return this;
  }

  async execute() {
    throw new Error('execute() must be implemented');
  }

  toSQL() {
    throw new Error('toSQL() must be implemented');
  }
}

module.exports = BaseQueryBuilder;
```

### PostgreSQL Query Builder

```javascript
// src/config/database/queryBuilders/PostgreSQLQueryBuilder.js
const BaseQueryBuilder = require('./BaseQueryBuilder');

class PostgreSQLQueryBuilder extends BaseQueryBuilder {
  toSQL() {
    let sql = `SELECT ${this.selectFields.join(', ')} FROM ${this.adapter.escapeIdentifier(this.table)}`;
    const params = [];

    // WHERE clause
    if (this.wheres.length > 0) {
      const whereClauses = this.wheres.map((where, index) => {
        if (where.operator === 'IN') {
          const placeholders = where.value.map((_, i) => `$${params.length + i + 1}`).join(', ');
          params.push(...where.value);
          return `${this.adapter.escapeIdentifier(where.column)} IN (${placeholders})`;
        } else {
          params.push(where.value);
          return `${this.adapter.escapeIdentifier(where.column)} ${where.operator} $${params.length}`;
        }
      });
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // ORDER BY
    if (this.orderBys.length > 0) {
      const orderClauses = this.orderBys.map(order => 
        `${this.adapter.escapeIdentifier(order.column)} ${order.direction}`
      );
      sql += ` ORDER BY ${orderClauses.join(', ')}`;
    }

    // LIMIT
    if (this.limitValue !== null) {
      params.push(this.limitValue);
      sql += ` LIMIT $${params.length}`;
    }

    // OFFSET
    if (this.offsetValue !== null) {
      params.push(this.offsetValue);
      sql += ` OFFSET $${params.length}`;
    }

    return { sql, params };
  }

  async execute() {
    const { sql, params } = this.toSQL();
    const result = await this.adapter.query(sql, params);
    return result.rows;
  }
}

module.exports = PostgreSQLQueryBuilder;
```

## Database Factory

```javascript
// src/config/database/index.js
const PostgreSQLAdapter = require('./PostgreSQLAdapter');
const MySQLAdapter = require('./MySQLAdapter');
const SQLiteAdapter = require('./SQLiteAdapter');
const config = require('../env');

let adapter = null;

function createAdapter() {
  const dbConfig = {
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_NAME,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    poolSize: config.DB_POOL_SIZE || 10
  };

  switch (config.DB_TYPE) {
    case 'postgresql':
      return new PostgreSQLAdapter(dbConfig);
    case 'mysql':
      return new MySQLAdapter(dbConfig);
    case 'sqlite':
      return new SQLiteAdapter({ database: config.DB_NAME });
    default:
      throw new Error(`Unsupported database type: ${config.DB_TYPE}`);
  }
}

async function initializeDatabase() {
  if (!adapter) {
    adapter = createAdapter();
    await adapter.connect();
  }
  return adapter;
}

function getDatabase() {
  if (!adapter) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return adapter;
}

module.exports = {
  initializeDatabase,
  getDatabase
};
```

## Migration System

```javascript
// src/config/database/migrations/Migration.js
class Migration {
  constructor(adapter) {
    this.adapter = adapter;
  }

  async up() {
    throw new Error('up() must be implemented');
  }

  async down() {
    throw new Error('down() must be implemented');
  }

  async execute(sql, params = []) {
    return await this.adapter.query(sql, params);
  }
}

module.exports = Migration;
```

```javascript
// src/config/database/migrations/001_create_tables.js
const Migration = require('./Migration');

class CreateTables extends Migration {
  async up() {
    // Create tables based on database type
    if (this.adapter.constructor.name === 'PostgreSQLAdapter') {
      await this.execute(`
        CREATE TABLE IF NOT EXISTS components (
          id VARCHAR(36) PRIMARY KEY,
          entity_type VARCHAR(50) NOT NULL,
          entity_id VARCHAR(36) NOT NULL,
          component_type VARCHAR(50) NOT NULL,
          data JSONB NOT NULL DEFAULT '{}',
          position INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else if (this.adapter.constructor.name === 'MySQLAdapter') {
      await this.execute(`
        CREATE TABLE IF NOT EXISTS components (
          id VARCHAR(36) PRIMARY KEY,
          entity_type VARCHAR(50) NOT NULL,
          entity_id VARCHAR(36) NOT NULL,
          component_type VARCHAR(50) NOT NULL,
          data JSON NOT NULL,
          position INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } else {
      // SQLite
      await this.execute(`
        CREATE TABLE IF NOT EXISTS components (
          id TEXT PRIMARY KEY,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          component_type TEXT NOT NULL,
          data TEXT NOT NULL DEFAULT '{}',
          position INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
    }
  }

  async down() {
    await this.execute('DROP TABLE IF EXISTS components;');
  }
}

module.exports = CreateTables;
```

## Usage Example

```javascript
// In a service
const { getDatabase } = require('../config/database');

class ComponentService {
  async create(data) {
    const db = getDatabase();
    return await db.insert('components', data);
  }

  async findById(id) {
    const db = getDatabase();
    return await db.findOne('components', { id });
  }

  async findByEntity(entityType, entityId) {
    const db = getDatabase();
    return await db.findMany('components', {
      entity_type: entityType,
      entity_id: entityId
    }, {
      orderBy: { field: 'position', direction: 'ASC' }
    });
  }
}
```

## JSON Handling Differences

### PostgreSQL
- Uses JSONB type
- Supports JSON operators: `->`, `->>`, `@>`
- GIN indexes for JSON queries

### MySQL
- Uses JSON type (MySQL 5.7+)
- Functions: `JSON_EXTRACT()`, `JSON_UNQUOTE()`
- Generated columns for indexing

### SQLite
- Stores JSON as TEXT
- Functions: `json_extract()`, `json()`
- No native JSON indexing

## Performance Considerations

1. **Connection Pooling**: Configure appropriate pool sizes
2. **Query Optimization**: Use indexes, avoid N+1 queries
3. **JSON Queries**: Use database-specific optimizations
4. **Transactions**: Use for batch operations
5. **Prepared Statements**: Always use parameterized queries

## Testing

```javascript
// tests/integration/database.test.js
const { initializeDatabase, getDatabase } = require('../../src/config/database');

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
      data: { content: { text: 'Test' } }
    };

    const inserted = await db.insert('components', data);
    expect(inserted.id).toBe('test-123');

    const found = await db.findOne('components', { id: 'test-123' });
    expect(found).toBeDefined();
    expect(found.component_type).toBe('heading');
  });
});
```

