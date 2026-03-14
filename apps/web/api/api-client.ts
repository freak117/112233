const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  token?: string;
  body?: unknown;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string, token?: string): Promise<T> {
    return this.request<T>(path, { method: 'GET', token });
  }

  async post<T>(path: string, body?: unknown, token?: string): Promise<T> {
    return this.request<T>(path, { method: 'POST', body, token });
  }

  async patch<T>(path: string, body?: unknown, token?: string): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body, token });
  }

  async delete<T>(path: string, token?: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE', token });
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  }
}

export const api = new ApiClient();
