import { ApiError } from '../../types/api.types';
import type { ApiResponse, RequestConfig, ApiClientConfig } from '../../types/api.types';

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private getAuthToken: (() => string | null) | null = null;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000;
    this.defaultHeaders = config.defaultHeaders || {};
  }

  setAuthTokenGetter(getter: () => string | null) {
    this.getAuthToken = getter;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    // Add auth token if available
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...this.defaultHeaders,
          ...config.headers,
        };

    if (this.getAuthToken) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token sent in request:', token.substring(0, 20) + '...');
      } else {
        console.warn('⚠️ No token available for request to:', url);
      }
    } else {
      console.warn('⚠️ No auth token getter configured for request to:', url);
    }

    try {
      const response = await fetch(url, {
        method: config.method || 'GET',
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: config.signal || controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.error
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408);
        }
        throw new ApiError(error.message, 0);
      }

      throw new ApiError('An unexpected error occurred', 0);
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  async patch<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body, headers });
  }

  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }
}

export const apiClient = new ApiClient({
  baseURL: '/api',
  timeout: 10000,
});

// Initialize auth token getter with a default function
apiClient.setAuthTokenGetter(() => {
  // Try to get token from localStorage as fallback
  const authData = localStorage.getItem('auth-storage');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      return parsed.state?.accessToken || null;
    } catch {
      return null;
    }
  }
  return null;
});
