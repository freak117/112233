import { api } from './api-client';

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

export const usersApi = {
  async getMe(token: string): Promise<UserProfile> {
    return api.get('/users/me', token);
  },

  async updateMe(
    token: string,
    data: { displayName?: string; bio?: string }
  ): Promise<UserProfile> {
    return api.patch('/users/me', data, token);
  },

  async searchUsers(token: string, query: string): Promise<SearchUser[]> {
    return api.get(`/search/users?q=${encodeURIComponent(query)}`, token);
  },

  async getOnlineStatus(userId: string): Promise<{ online: boolean }> {
    return api.get(`/users/${userId}/online`);
  },

  async getBulkOnlineStatus(
    token: string,
    userIds: string[]
  ): Promise<Record<string, boolean>> {
    return api.post('/users/online/bulk', { userIds }, token);
  },
};
