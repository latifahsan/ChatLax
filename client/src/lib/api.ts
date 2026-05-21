import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL.endsWith('/') ? API_URL : API_URL + '/',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach token from Zustand persist storage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('chatlax-auth');
      if (stored) {
        const { state } = JSON.parse(stored);
        if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch {}
  }
  return config;
});

// Handle 401 globally — clears storage and redirects to login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('chatlax-auth');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  googleLogin: (credential: string) => api.post('auth/google', { credential }),
  register: (data: { name: string; email: string; password: string }) => api.post('auth/register', data),
  login: (data: { email: string; password: string }) => api.post('auth/login', data),
  getMe: () => api.get('auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.put('auth/change-password', data),
};

// Chats
export const chatAPI = {
  getChats: () => api.get('chats'),
  getOrCreatePrivate: (userId: string) => api.post('chats/private', { userId }),
  createGroup: (data: { name: string; participants: string[]; description?: string }) =>
    api.post('chats/group', data),
  updateGroup: (chatId: string, data: object) => api.put(`chats/${chatId}`, data),
  pinMessage: (chatId: string, messageId: string | null) => api.put(`chats/${chatId}/pin`, { messageId }),
  searchUsers: (q: string) => api.get(`chats/search/users?q=${encodeURIComponent(q)}`),
};

// Messages
export const messageAPI = {
  getMessages: (chatId: string, page = 1) => api.get(`messages/${chatId}?page=${page}`),
  sendMessage: (chatId: string, data: object) => api.post(`messages/${chatId}`, data),
  editMessage: (messageId: string, content: string) => api.put(`messages/${messageId}`, { content }),
  deleteMessage: (messageId: string, forEveryone: boolean) =>
    api.delete(`messages/${messageId}`, { data: { forEveryone } }),
  reactToMessage: (messageId: string, emoji: string) => api.post(`messages/${messageId}/react`, { emoji }),
  markAsRead: (chatId: string) => api.post(`messages/${chatId}/read`),
};

// Users
export const userAPI = {
  updateProfile: (data: object) => api.put('users/profile', data),
  getUserById: (userId: string) => api.get(`users/${userId}`),
};

// Uploads
export const uploadAPI = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// Extract user-friendly error message from axios error
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

export default api;
