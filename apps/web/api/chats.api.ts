import { api } from './api-client';

export interface ChatSummary {
  chatId: string;
  type: 'direct';
  updatedAt: string;
  participants: Array<{
    id: string;
    username: string;
    displayName: string;
  }>;
  lastMessage: {
    id: string;
    text: string | null;
    createdAt: string;
  } | null;
}

export interface ChatDetail {
  id: string;
  type: 'direct';
  participants: Array<{
    id: string;
    username: string;
    displayName: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const chatsApi = {
  async list(token: string): Promise<ChatSummary[]> {
    return api.get('/chats', token);
  },

  async createDirect(token: string, targetUserId: string): Promise<ChatDetail> {
    return api.post('/chats/direct', { targetUserId }, token);
  },

  async getDetail(token: string, chatId: string): Promise<ChatDetail> {
    return api.get(`/chats/${chatId}`, token);
  },
};
