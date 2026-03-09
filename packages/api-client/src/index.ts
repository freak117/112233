import type {
  AuthResponse,
  ChatSummary,
  HealthResponse,
  MessageListResponse,
  MessageType,
  SearchUser,
  UploadImageResponse,
  UserProfile,
} from '@telegram-lite/types';

type HttpMethod = 'GET' | 'POST' | 'PATCH';

interface RequestOptions {
  method?: HttpMethod;
  token?: string;
  body?: unknown;
}

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  register(payload: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', { method: 'POST', body: payload });
  }

  login(payload: { email: string; password: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', { method: 'POST', body: payload });
  }

  refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    return this.request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });
  }

  logout(refreshToken: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
    });
  }

  getMe(token: string): Promise<UserProfile> {
    return this.request<UserProfile>('/users/me', { token });
  }

  updateMe(
    token: string,
    payload: Partial<Pick<UserProfile, 'displayName' | 'username' | 'bio' | 'avatarUrl'>>,
  ): Promise<UserProfile> {
    return this.request<UserProfile>('/users/me', { method: 'PATCH', token, body: payload });
  }

  searchUsers(token: string, username: string): Promise<SearchUser[]> {
    return this.request<SearchUser[]>(`/search/users?username=${encodeURIComponent(username)}`, { token });
  }

  createDirectChat(token: string, targetUserId: string): Promise<{ id: string; type: 'direct' }> {
    return this.request<{ id: string; type: 'direct' }>('/chats/direct', {
      method: 'POST',
      token,
      body: { targetUserId },
    });
  }

  listChats(token: string): Promise<ChatSummary[]> {
    return this.request<ChatSummary[]>('/chats', { token });
  }

  sendMessage(
    token: string,
    payload: {
      chatId: string;
      text?: string;
      imageUrl?: string;
      clientMessageId: string;
      type?: MessageType;
    },
  ): Promise<unknown> {
    return this.request('/messages', { method: 'POST', token, body: payload });
  }

  listMessages(token: string, chatId: string, cursor?: string, limit = 30): Promise<MessageListResponse> {
    const params = new URLSearchParams({ chatId, limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return this.request<MessageListResponse>(`/messages?${params.toString()}`, { token });
  }

  uploadImage(token: string, base64: string, filename = 'image.png'): Promise<UploadImageResponse> {
    return this.request<UploadImageResponse>('/uploads/image', {
      method: 'POST',
      token,
      body: { base64, filename },
    });
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

export async function getHealth(baseUrl: string): Promise<HealthResponse> {
  return new ApiClient(baseUrl).getHealth();
}

