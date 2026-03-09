export type UserId = string;

export interface HealthResponse {
  status: 'ok' | 'degraded';
  services: {
    api: { ok: boolean; details?: string };
    database: { ok: boolean; details?: string };
    redis: { ok: boolean; details?: string };
    minio: { ok: boolean; details?: string };
  };
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
}

export interface SearchUser {
  id: string;
  username: string;
  displayName: string;
}

export interface ChatSummary {
  chatId: string;
  type: 'direct';
  updatedAt: string;
  participants: Array<{ id: string; username: string; displayName: string }>;
  lastMessage: MessageItem | null;
}

export type MessageType = 'text' | 'image' | 'text_image' | 'system';

export interface MessageItem {
  id: string;
  chatId: string;
  senderId: string;
  type: 'text' | 'image' | 'text_image' | 'system';
  text: string | null;
  clientMessageId: string | null;
  createdAt: string;
}

export interface MessageListResponse {
  items: MessageItem[];
  nextCursor: string | null;
}

export interface UploadImageResponse {
  fileId: string;
  url: string;
  mimeType: string;
  size: number;
}

