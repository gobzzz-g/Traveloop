import api from '@/lib/api';
import { ApiResponse, Trip } from '@/types';

export interface CreateTripData {
  title: string;
  description?: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  budget?: number;
  currency?: string;
  travelStyle?: string;
  privacy?: string;
  travelersCount?: number;
  tags?: string[];
}

export interface ListTripsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  travelStyle?: string;
  sortBy?: string;
  sortOrder?: string;
  archived?: boolean;
}

export const tripService = {
  getTrips: async (params: ListTripsParams = {}) => {
    const res = await api.get<ApiResponse<Trip[]>>('/trips', { params });
    return res.data;
  },

  getTripById: async (id: string) => {
    const res = await api.get<ApiResponse<Trip>>(`/trips/${id}`);
    return res.data;
  },

  createTrip: async (data: CreateTripData) => {
    const res = await api.post<ApiResponse<Trip>>('/trips', data);
    return res.data;
  },

  updateTrip: async (id: string, data: Partial<CreateTripData> & { isArchived?: boolean; status?: string }) => {
    const res = await api.put<ApiResponse<Trip>>(`/trips/${id}`, data);
    return res.data;
  },

  deleteTrip: async (id: string) => {
    const res = await api.delete(`/trips/${id}`);
    return res.data;
  },

  duplicateTrip: async (id: string) => {
    const res = await api.post<ApiResponse<Trip>>(`/trips/${id}/duplicate`);
    return res.data;
  },

  getTripStats: async () => {
    const res = await api.get('/trips/stats');
    return res.data;
  },
};
