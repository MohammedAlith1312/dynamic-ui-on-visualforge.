# Real-time Updates Plan

## Overview

This document describes the WebSocket implementation using Socket.io to replace Supabase Realtime. It enables real-time collaboration, live updates, and change notifications.

## Architecture

### Components

1. **WebSocket Server**: Socket.io server setup
2. **Room Management**: Channel/room organization
3. **Event Handlers**: Handle client events
4. **Broadcasting**: Send updates to connected clients
5. **Presence System**: Track who's online

## Socket.io Setup

### Server Initialization

```javascript
// src/websocket/server.js
const { Server } = require('socket.io');
const { authenticateSocket } = require('./auth');
const { handleConnection } = require('./handlers');
const RoomManager = require('./rooms');

function initializeWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(authenticateSocket);

  // Connection handler
  io.on('connection', (socket) => {
    handleConnection(io, socket);
  });

  return io;
}

module.exports = { initializeWebSocket };
```

### Socket Authentication

```javascript
// src/websocket/auth.js
const jwt = require('jsonwebtoken');

async function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userEmail = decoded.email;
    socket.userRole = decoded.role;
    
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
}

module.exports = { authenticateSocket };
```

## Connection Handler

```javascript
// src/websocket/handlers.js
const RoomManager = require('./rooms');

function handleConnection(io, socket) {
  console.log(`User ${socket.userId} connected`);

  // Join user's personal room
  socket.join(`user:${socket.userId}`);

  // Handle component/object subscription
  socket.on('component:subscribe', (data) => {
    const { componentId } = data;
    const room = `component:${componentId}`;
    socket.join(room);
    RoomManager.addUser(room, socket.userId);
    
    // Notify others of new subscriber
    socket.to(room).emit('component:user-joined', {
      userId: socket.userId,
      userEmail: socket.userEmail
    });
  });

  socket.on('component:unsubscribe', (data) => {
    const { componentId } = data;
    const room = `component:${componentId}`;
    socket.leave(room);
    RoomManager.removeUser(room, socket.userId);
  });

  // Handle component/object updates
  socket.on('component:update', async (data) => {
    const { componentId, updates } = data;
    
    // Validate and save to database
    // ... (save logic)
    
    // Broadcast to room
    const room = `component:${componentId}`;
    
    socket.to(room).emit('component:updated', {
      componentId,
      updates,
      updatedBy: socket.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Handle nested component updates
  socket.on('component:nested-update', async (data) => {
    const { componentId, rowId, nestedComponentId, updates } = data;
    
    // Update nested component
    // ... (save logic)
    
    // Broadcast to room
    const room = `component:${componentId}`;
    
    socket.to(room).emit('component:nested-updated', {
      componentId,
      rowId,
      nestedComponentId,
      updates,
      updatedBy: socket.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Handle nested component creation
  socket.on('component:nested-create', async (data) => {
    const { componentId, rowId, nestedComponent } = data;
    
    // Add nested component
    // ... (save logic)
    
    // Broadcast to room
    const room = `component:${componentId}`;
    io.to(room).emit('component:nested-created', {
      componentId,
      rowId,
      nestedComponent,
      createdBy: socket.userId
    });
  });

  // Handle nested component deletion
  socket.on('component:nested-delete', async (data) => {
    const { componentId, rowId, nestedComponentId } = data;
    
    // Delete nested component
    // ... (save logic)
    
    // Broadcast to room
    const room = `component:${componentId}`;
    io.to(room).emit('component:nested-deleted', {
      componentId,
      rowId,
      nestedComponentId,
      deletedBy: socket.userId
    });
  });

  // Handle typing indicators (optional)
  socket.on('component:typing', (data) => {
    const { componentId } = data;
    const room = `component:${componentId}`;
    
    socket.to(room).emit('component:typing', {
      componentId,
      userId: socket.userId,
      userEmail: socket.userEmail
    });
  });

  // Handle cursor position (optional, for collaborative editing)
  socket.on('component:cursor', (data) => {
    const { entityType, entityId, componentId, position } = data;
    const room = `entity:${entityType}:${entityId}`;
    
    socket.to(room).emit('component:cursor', {
      componentId,
      userId: socket.userId,
      userEmail: socket.userEmail,
      position
    });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
    RoomManager.removeUserFromAllRooms(socket.userId);
  });
}

module.exports = { handleConnection };
```

## Room Management

```javascript
// src/websocket/rooms.js
class RoomManager {
  constructor() {
    this.rooms = new Map(); // room -> Set of userIds
    this.userRooms = new Map(); // userId -> Set of rooms
  }

  addUser(room, userId) {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room).add(userId);

    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId).add(room);
  }

  removeUser(room, userId) {
    if (this.rooms.has(room)) {
      this.rooms.get(room).delete(userId);
      if (this.rooms.get(room).size === 0) {
        this.rooms.delete(room);
      }
    }

    if (this.userRooms.has(userId)) {
      this.userRooms.get(userId).delete(room);
      if (this.userRooms.get(userId).size === 0) {
        this.userRooms.delete(userId);
      }
    }
  }

  removeUserFromAllRooms(userId) {
    if (this.userRooms.has(userId)) {
      const rooms = Array.from(this.userRooms.get(userId));
      rooms.forEach(room => {
        this.removeUser(room, userId);
      });
    }
  }

  getUsersInRoom(room) {
    return Array.from(this.rooms.get(room) || []);
  }

  getRoomsForUser(userId) {
    return Array.from(this.userRooms.get(userId) || []);
  }
}

module.exports = new RoomManager();
```

## Integration with Services

### Broadcast Component Updates

```javascript
// In ComponentService
const { getIO } = require('../websocket/server');

class ComponentService {
  async update(id, updates, userId) {
    const component = await Component.update(id, updates, this.db);
    
    // Broadcast update via WebSocket
    const io = getIO();
    if (io) {
      const room = `entity:${component.entity_type}:${component.entity_id}`;
      io.to(room).emit('component:updated', {
        componentId: id,
        updates,
        updatedBy: userId,
        timestamp: new Date().toISOString()
      });
    }
    
    return component;
  }
}
```

## Frontend Integration

### Socket.io Client Setup

```typescript
// src/api/websocket.ts
import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    this.socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToComponent(componentId: string) {
    if (!this.socket) return;

    this.socket.emit('component:subscribe', { componentId });
  }

  unsubscribeFromComponent(componentId: string) {
    if (!this.socket) return;

    this.socket.emit('component:unsubscribe', { componentId });
  }

  onComponentUpdated(callback: (data: any) => void) {
    if (!this.socket) return;

    this.socket.on('component:updated', callback);
  }

  onComponentCreated(callback: (data: any) => void) {
    if (!this.socket) return;

    this.socket.on('component:created', callback);
  }

  onComponentDeleted(callback: (data: any) => void) {
    if (!this.socket) return;

    this.socket.on('component:deleted', callback);
  }

  updateComponent(componentId: string, updates: any) {
    if (!this.socket) return;

    this.socket.emit('component:update', { componentId, updates });
  }
}

export const wsClient = new WebSocketClient();
```

### React Hook

```typescript
// src/hooks/useRealtime.ts
import { useEffect, useCallback } from 'react';
import { wsClient } from '@/api/websocket';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtime(componentId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    wsClient.subscribeToComponent(componentId);

    const handleUpdate = (data: any) => {
      queryClient.invalidateQueries(['component', componentId]);
    };

    const handleNestedUpdate = (data: any) => {
      queryClient.invalidateQueries(['component', componentId]);
    };

    wsClient.onComponentUpdated(handleUpdate);
    wsClient.on('component:nested-updated', handleNestedUpdate);
    wsClient.on('component:nested-created', handleNestedUpdate);
    wsClient.on('component:nested-deleted', handleNestedUpdate);

    return () => {
      wsClient.unsubscribeFromComponent(componentId);
    };
  }, [componentId, queryClient]);
}
```

## Event Types

### Client to Server

- `component:subscribe` - Subscribe to component/object updates
- `component:unsubscribe` - Unsubscribe from component
- `component:update` - Update entire component/object
- `component:nested-update` - Update nested component within object
- `component:nested-create` - Create nested component
- `component:nested-delete` - Delete nested component
- `component:typing` - Typing indicator
- `component:cursor` - Cursor position

### Server to Client

- `component:updated` - Component/object was updated
- `component:nested-updated` - Nested component was updated
- `component:nested-created` - Nested component was created
- `component:nested-deleted` - Nested component was deleted
- `component:user-joined` - User joined room
- `component:user-left` - User left room
- `component:typing` - Someone is typing
- `component:cursor` - Cursor position update

## Conflict Resolution

### Optimistic Updates with Conflict Detection

```javascript
// Frontend: Optimistic update
const updateComponent = async (id, updates) => {
  // Optimistic update
  queryClient.setQueryData(['component', id], (old) => ({
    ...old,
    ...updates
  }));

  try {
    // Send to server
    await api.updateComponent(id, updates);
  } catch (error) {
    // Revert on error
    queryClient.invalidateQueries(['component', id]);
  }
};

// Listen for conflicts
wsClient.onComponentUpdated((data) => {
  if (data.updatedBy !== currentUserId) {
    // Someone else updated, refresh data
    queryClient.invalidateQueries(['component', data.componentId]);
  }
});
```

## Performance Considerations

1. **Room Size**: Limit users per room
2. **Message Throttling**: Throttle frequent updates
3. **Connection Pooling**: Reuse connections
4. **Message Compression**: Compress large payloads
5. **Selective Broadcasting**: Only send to relevant clients

## Fallback to Polling

```typescript
// Fallback if WebSocket fails
if (!wsClient.socket?.connected) {
  // Use polling instead
  const pollInterval = setInterval(() => {
    queryClient.invalidateQueries(['components', entityType, entityId]);
  }, 5000); // Poll every 5 seconds

  return () => clearInterval(pollInterval);
}
```

## Testing

```javascript
// tests/websocket/handlers.test.js
const { createServer } = require('http');
const { Server } = require('socket.io');
const { io: client } = require('socket.io-client');

describe('WebSocket Handlers', () => {
  let httpServer, io, clientSocket;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = client(`http://localhost:${port}`, {
        auth: { token: 'test-token' }
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  it('should handle component subscription', (done) => {
    clientSocket.emit('component:subscribe', {
      entityType: 'page',
      entityId: 'page-123'
    });

    clientSocket.on('component:user-joined', (data) => {
      expect(data.userId).toBeDefined();
      done();
    });
  });
});
```

