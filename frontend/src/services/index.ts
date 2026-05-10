import api from '@/lib/api';
import { ApiResponse } from '@/types';

export const aiService = {
  generateItinerary: async (params: {
    destination: string;
    days: number;
    budget: number;
    currency: string;
    travelStyle: string;
    travelers: number;
    interests?: string[];
    startDate?: string;
  }) => {
    const res = await api.post<ApiResponse<unknown>>('/ai/itinerary', params);
    return res.data;
  },

  estimateBudget: async (params: {
    origin: string;
    destination: string;
    days: number;
    travelers: number;
    travelStyle: string;
    currency: string;
  }) => {
    const res = await api.post<ApiResponse<unknown>>('/ai/budget', params);
    return res.data;
  },

  chat: async (message: string, history: { role: 'user' | 'model'; content: string }[], context?: object) => {
    const res = await api.post<ApiResponse<{ reply: string }>>('/ai/chat', { message, history, context });
    return res.data;
  },

  generatePackingList: async (params: {
    destination: string;
    days: number;
    travelStyle: string;
    season?: string;
    activities?: string[];
    weather?: string;
  }) => {
    const res = await api.post<ApiResponse<unknown>>('/ai/packing', params);
    return res.data;
  },

  getDestinationInsights: async (city: string, country: string) => {
    const res = await api.get<ApiResponse<unknown>>(`/ai/destination/${encodeURIComponent(city)}/${encodeURIComponent(country)}`);
    return res.data;
  },
};

export const budgetService = {
  getBudget: async (tripId: string) => {
    const res = await api.get(`/budget/${tripId}`);
    return res.data;
  },

  updateBudget: async (tripId: string, data: object) => {
    const res = await api.put(`/budget/${tripId}`, data);
    return res.data;
  },
};

export const destinationService = {
  addDestination: async (data: object) => {
    const res = await api.post('/destinations', data);
    return res.data;
  },

  updateDestination: async (id: string, data: object) => {
    const res = await api.put(`/destinations/${id}`, data);
    return res.data;
  },

  deleteDestination: async (id: string) => {
    const res = await api.delete(`/destinations/${id}`);
    return res.data;
  },

  reorderDestinations: async (tripId: string, orderedIds: string[]) => {
    const res = await api.put('/destinations/reorder', { tripId, orderedIds });
    return res.data;
  },
};

export const activityService = {
  addActivity: async (data: object) => {
    const res = await api.post('/activities', data);
    return res.data;
  },

  updateActivity: async (id: string, data: object) => {
    const res = await api.put(`/activities/${id}`, data);
    return res.data;
  },

  deleteActivity: async (id: string) => {
    const res = await api.delete(`/activities/${id}`);
    return res.data;
  },
};

export const packingService = {
  getPackingItems: async (tripId: string) => {
    const res = await api.get(`/packing/${tripId}`);
    return res.data;
  },

  addItem: async (data: object) => {
    const res = await api.post('/packing', data);
    return res.data;
  },

  updateItem: async (id: string, data: object) => {
    const res = await api.put(`/packing/${id}`, data);
    return res.data;
  },

  deleteItem: async (id: string) => {
    const res = await api.delete(`/packing/${id}`);
    return res.data;
  },

  bulkAdd: async (tripId: string, items: { title: string; category: string }[]) => {
    const res = await api.post('/packing/bulk', { tripId, items });
    return res.data;
  },
};

export const noteService = {
  getNotes: async (params?: { tripId?: string; page?: number; limit?: number }) => {
    const res = await api.get('/notes', { params });
    return res.data;
  },

  createNote: async (data: object) => {
    const res = await api.post('/notes', data);
    return res.data;
  },

  updateNote: async (id: string, data: object) => {
    const res = await api.put(`/notes/${id}`, data);
    return res.data;
  },

  deleteNote: async (id: string) => {
    const res = await api.delete(`/notes/${id}`);
    return res.data;
  },
};

export const shareService = {
  createShareLink: async (tripId: string, expiresInDays?: number) => {
    const res = await api.post('/share', { tripId, expiresInDays });
    return res.data;
  },

  getSharedTrip: async (slug: string) => {
    const res = await api.get(`/share/${slug}`);
    return res.data;
  },

  likeTrip: async (slug: string) => {
    const res = await api.post(`/share/${slug}/like`);
    return res.data;
  },

  getPublicTrips: async (params?: { page?: number; limit?: number; search?: string }) => {
    const res = await api.get('/share/public', { params });
    return res.data;
  },
};

export const profileService = {
  getProfile: async () => {
    const res = await api.get('/profile');
    return res.data;
  },

  updateProfile: async (data: { name?: string; language?: string; timezone?: string }) => {
    const res = await api.put('/profile', data);
    return res.data;
  },

  updateAvatar: async (avatarUrl: string) => {
    const res = await api.put('/profile/avatar', { avatarUrl });
    return res.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await api.put('/profile/password', data);
    return res.data;
  },
};

export const weatherService = {
  getWeather: async (city: string) => {
    const res = await api.get(`/weather/${encodeURIComponent(city)}`);
    return res.data;
  },
};

export const cityService = {
  searchCities: async (q: string, limit = 10) => {
    const res = await api.get('/cities/search', { params: { q, limit } });
    return res.data;
  },

  getCityImage: async (city: string) => {
    const res = await api.get(`/cities/image/${encodeURIComponent(city)}`);
    return res.data;
  },
};

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  updateUserRole: async (userId: string, role: 'USER' | 'ADMIN') => {
    const res = await api.put(`/admin/users/${userId}/role`, { role });
    return res.data;
  },

  deleteUser: async (userId: string) => {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  },
};
