import { api } from './api-client';

export type MessageType = 'text' | 'image' | 'text_image' | 'system';

export interface MessageItem {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  text: string | null;
  clientMessageId: string | null;
  createdAt: string;
}

export interface MessageListResponse {
  items: MessageItem[];
  nextCursor: string | null;
}

export interface SendMessageRequest {
  chatId: string;
  text?: string;
  imageUrl?: string;
  type?: MessageType;
  clientMessageId?: string;
}

export const messagesApi = {
  async list(
    token: string,
    chatId: string,
    cursor?: string,
    limit = 30
  ): Promise<MessageListResponse> {
    const params = new URLSearchParams({ chatId, limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return api.get(`/messages?${params.toString()}`, token);
  },

  async send(token: string, data: SendMessageRequest) {
    return api.post('/messages', data, token);
  },

  async markAsDelivered(token: string, messageId: string) {
    return api.post(`/messages/${messageId}/delivered`, {}, token);
  },

  async markAsRead(token: string, messageId: string) {
    return api.post(`/messages/${messageId}/read`, {}, token);
  },
};
