import { API_CONFIG } from '@constants/config';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return `${this.baseURL}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private getHeaders(custom?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      ...API_CONFIG.headers,
      ...custom,
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  private async request<T>(
    method: RequestMethod,
    path: string,
    data?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const url = this.buildUrl(path);
    const headers = this.getHeaders(customHeaders);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new ApiError(
          errorBody.message || `Request failed with status ${response.status}`,
          response.status,
          errorBody
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timed out', 408);
      }
      throw new ApiError('Network error occurred', 0);
    }
  }

  get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', path, undefined, headers);
  }

  post<T>(path: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', path, data, headers);
  }

  put<T>(path: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', path, data, headers);
  }

  patch<T>(path: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PATCH', path, data, headers);
  }

  delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('DELETE', path, undefined, headers);
  }
}

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const apiClient = new ApiClient();
