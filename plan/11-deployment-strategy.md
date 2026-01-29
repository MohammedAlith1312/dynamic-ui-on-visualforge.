# Deployment Strategy Plan

## Overview

This document describes the deployment strategy for the Node.js backend, including server setup, database configuration, monitoring, and scaling considerations.

## Server Setup

### Using PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'visual-forge-hub-api',
    script: './src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

### Using Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_TYPE=postgresql
      - DB_HOST=db
      - DB_NAME=visual_forge_hub
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=visual_forge_hub
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Environment Configuration

### Production Environment Variables

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

# Database
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=visual_forge_hub
DB_USER=postgres
DB_PASSWORD=secure-password
DB_POOL_SIZE=20

# JWT
JWT_SECRET=very-secure-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=very-secure-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Storage
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET_NAME=your-bucket

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
FROM_EMAIL=noreply@yourdomain.com

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
```

## Database Setup

### PostgreSQL Production Setup

```sql
-- Create database
CREATE DATABASE visual_forge_hub;

-- Create user
CREATE USER vfh_user WITH PASSWORD 'secure-password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE visual_forge_hub TO vfh_user;

-- Run migrations
\c visual_forge_hub
\i migrations/001_create_tables.sql
```

### Backup Strategy

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres visual_forge_hub > /backups/backup_$DATE.sql

# Keep only last 30 days
find /backups -name "backup_*.sql" -mtime +30 -delete
```

## SSL/TLS Configuration

### Using Nginx as Reverse Proxy

```nginx
# /etc/nginx/sites-available/visual-forge-hub
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring

### Using Winston for Logging

```javascript
// Production logger configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Health Check Endpoint

```javascript
// src/routes/health.js
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'unknown',
    memory: process.memoryUsage()
  };

  try {
    // Check database connection
    await db.query('SELECT 1');
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'degraded';
  }

  res.json(health);
});
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or AWS ALB
2. **Stateless Design**: No session storage in memory
3. **Shared Database**: All instances use same database
4. **Shared Cache**: Use Redis for shared cache
5. **WebSocket**: Use Redis adapter for Socket.io

### Redis Adapter for Socket.io

```javascript
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

## CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/visual-forge-hub
            git pull
            npm install
            npm run build
            pm2 restart visual-forge-hub-api
```

## Deployment Checklist

- [ ] Set up production server
- [ ] Configure database
- [ ] Set environment variables
- [ ] Run migrations
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Set up CI/CD
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation

