# Frontend API Client Plan

## Overview

This document describes the frontend API client that replaces the Supabase client. It provides a clean interface for making API calls, handling authentication, error handling, and React Query integration.

## API Client Class

```typescript
// src/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry original request
            return this.client.request(error.config!);
          } else {
            // Redirect to login
            window.location.href = '/auth';
          }
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await axios.post(`${this.client.defaults.baseURL}/auth/refresh`, {
        refreshToken
      });

      if (response.data.success) {
        this.setToken(response.data.data.token);
        localStorage.setItem('token', response.data.data.token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private handleError(error: AxiosError) {
    if (error.response) {
      return {
        message: error.response.data?.error || 'An error occurred',
        status: error.response.status,
        code: error.response.data?.code,
        details: error.response.data?.details
      };
    }
    return {
      message: error.message || 'Network error',
      status: 0
    };
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.patch(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1');
```

## React Query Integration

```typescript
// src/api/queries.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from './client';

// Components/Objects (unified API)
export function useComponents(componentType?: string, options?: UseQueryOptions) {
  return useQuery({
    queryKey: ['components', componentType],
    queryFn: () => {
      const url = componentType 
        ? `/components?componentType=${componentType}` 
        : '/components';
      return apiClient.get(url);
    },
    ...options
  });
}

export function useComponent(id: string, options?: UseQueryOptions) {
  return useQuery({
    queryKey: ['component', id],
    queryFn: () => apiClient.get(`/components/${id}`),
    ...options
  });
}

export function useComponentBySlug(slug: string, options?: UseQueryOptions) {
  return useQuery({
    queryKey: ['component', 'slug', slug],
    queryFn: () => apiClient.get(`/components/slug/${slug}`),
    ...options
  });
}

export function useCreateComponent(options?: UseMutationOptions) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.post('/components', data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['components', variables.componentType]);
    },
    ...options
  });
}

export function useUpdateComponent(options?: UseMutationOptions) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient.put(`/components/${id}`, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['component', variables.id]);
      queryClient.invalidateQueries(['components']);
    },
    ...options
  });
}

export function usePatchComponent(options?: UseMutationOptions) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any[] }) => 
      apiClient.patch(`/components/${id}`, { patch }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['component', variables.id]);
    },
    ...options
  });
}

export function useDeleteComponent(options?: UseMutationOptions) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/components/${id}`),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['components']);
    },
    ...options
  });
}

// Nested component operations
export function useAddNestedComponent(options?: UseMutationOptions) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ componentId, rowId, nestedComponent }: any) =>
      apiClient.post(`/components/${componentId}/rows/${rowId}/components`, nestedComponent),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['component', variables.componentId]);
    },
    ...options
  });
}

export function useUpdateNestedComponent(options?: UseMutationOptions) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ componentId, rowId, nestedComponentId, updates }: any) =>
      apiClient.put(`/components/${componentId}/rows/${rowId}/components/${nestedComponentId}`, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['component', variables.componentId]);
    },
    ...options
  });
}

// Authentication
export function useLogin(options?: UseMutationOptions) {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiClient.post('/auth/login', credentials),
    ...options
  });
}

export function useRegister(options?: UseMutationOptions) {
  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string }) =>
      apiClient.post('/auth/register', data),
    ...options
  });
}
```

## Custom Hooks

```typescript
// src/api/hooks/useAuth.ts
import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../client';
import { wsClient } from '../websocket';

export function useAuth() {
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      apiClient.setToken(token);
      wsClient.connect(token);
    }
  }, [token]);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.get('/auth/profile'),
    enabled: !!token
  });

  const logout = useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      apiClient.setToken(null);
      wsClient.disconnect();
      window.location.href = '/auth';
    }
  });

  return {
    user: user?.data,
    isAuthenticated: !!token,
    logout: logout.mutate
  };
}
```

## WebSocket Client

```typescript
// src/api/websocket.ts
import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  private socket: Socket | null = null;

  connect(token: string) {
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
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(entityType: string, entityId: string) {
    if (!this.socket) return;
    this.socket.emit('component:subscribe', { entityType, entityId });
  }

  unsubscribe(entityType: string, entityId: string) {
    if (!this.socket) return;
    this.socket.emit('component:unsubscribe', { entityType, entityId });
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }
}

export const wsClient = new WebSocketClient();
```

## Type Definitions

```typescript
// src/api/types.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Component {
  id: string;
  componentType: 'page' | 'widget' | 'layout' | 'form' | 'query' | 'api_collection' | 'entity' | 'template';
  name: string;
  slug: string;
  title: string;
  description?: string;
  data: ComponentData;
  isPublished: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentData {
  meta?: {
    menuOrder?: number;
    layoutId?: string | null;
    seo?: SEOConfig;
    category?: string;
    reusable?: boolean;
    [key: string]: any;
  };
  rows?: Row[];
  sections?: Section[];  // For forms
  joins?: Join[];        // For queries
  fields?: Field[];      // For queries
  [key: string]: any;
}

export interface Row {
  id: string;
  position: number;
  columns: number;
  columnWidths?: number[];
  styles?: Record<string, any>;
  responsiveConfig?: Record<string, any>;
  components: NestedComponent[];
}

export interface NestedComponent {
  id: string;
  componentType: string;
  position: number;
  columnIndex: number;
  data: {
    content: Record<string, any>;
    styles?: Record<string, any>;
    config?: Record<string, any>;
  };
}
```

## Migration from Supabase Client

### Before (Supabase)

```typescript
// Fetch page
const { data: page } = await supabase
  .from('pages')
  .select('*')
  .eq('id', pageId)
  .single();

// Fetch rows
const { data: rows } = await supabase
  .from('page_rows')
  .select('*')
  .eq('page_id', pageId);

// Fetch components
const { data: components } = await supabase
  .from('page_components')
  .select('*')
  .eq('page_id', pageId);
```

### After (API Client - Single Object)

```typescript
// Single query gets everything
const { data } = await apiClient.get(`/components/${pageId}`);
// data.data contains: { meta: {...}, rows: [{ components: [...] }] }
```

## Error Handling

```typescript
// src/api/errors.ts
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Usage in components
try {
  await createComponent.mutateAsync(data);
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message);
  }
}
```

## Optimistic Updates

```typescript
export function useOptimisticUpdateComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: any) => apiClient.put(`/components/${id}`, updates),
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries(['component', id]);
      const previous = queryClient.getQueryData(['component', id]);
      
      queryClient.setQueryData(['component', id], (old: any) => ({
        ...old,
        ...updates
      }));
      
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['component', variables.id], context?.previous);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries(['component', variables.id]);
    }
  });
}
```

