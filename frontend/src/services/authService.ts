import api from '@/lib/api';
import { ApiResponse, AuthResponse, User } from '@/types';

export const authService = {
  signup: async (data: { name: string; email: string; password: string }) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/signup', data);
    return res.data;
  },

  login: async (data: { email: string; password: string; rememberMe?: boolean }) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data;
  },

  googleAuth: async (idToken: string) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/google', { idToken });
    return res.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data: { token: string; password: string }) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },

  verifyEmail: async (token: string) => {
    const res = await api.get(`/auth/verify-email?token=${token}`);
    return res.data;
  },

  refreshToken: async () => {
    const res = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
    return res.data;
  },
};
