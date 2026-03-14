// API Client
export { ApiClient, api } from './api-client';

// Auth
export { authApi } from './auth.api';
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshResponse,
} from './auth.api';

// Users
export { usersApi } from './users.api';
export type { UserProfile, SearchUser } from './users.api';

// Chats
export { chatsApi } from './chats.api';
export type { ChatSummary, ChatDetail } from './chats.api';

// Messages
export { messagesApi } from './messages.api';
export type {
  MessageType,
  MessageItem,
  MessageListResponse,
  SendMessageRequest,
} from './messages.api';

// Uploads
export { uploadsApi } from './uploads.api';
export type { UploadImageResponse } from './uploads.api';
