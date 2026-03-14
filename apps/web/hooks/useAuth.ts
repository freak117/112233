import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi, usersApi } from '../api';

export function useAuth() {
  const { user, token, refreshToken, isAuthenticated, setAuth, clearAuth, updateUser } =
    useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login({ email, password });
      setAuth(response.user, response.accessToken, response.refreshToken);
      return response;
    },
    [setAuth]
  );

  const register = useCallback(
    async (email: string, password: string, username: string, displayName: string) => {
      const response = await authApi.register({ email, password, username, displayName });
      setAuth(response.user, response.accessToken, response.refreshToken);
      return response;
    },
    [setAuth]
  );

  const logout = useCallback(async () => {
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    clearAuth();
  }, [refreshToken, clearAuth]);

  const updateProfile = useCallback(
    async (data: { displayName?: string; bio?: string }) => {
      if (!token) throw new Error('Not authenticated');
      const updated = await usersApi.updateMe(token, data);
      updateUser(updated);
      return updated;
    },
    [token, updateUser]
  );

  const refreshSession = useCallback(async () => {
    if (!refreshToken) return null;
    
    try {
      const response = await authApi.refresh(refreshToken);
      setAuth(user!, response.accessToken, response.refreshToken);
      return response;
    } catch (e) {
      clearAuth();
      return null;
    }
  }, [refreshToken, user, setAuth, clearAuth]);

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshSession,
  };
}
