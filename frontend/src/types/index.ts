// API type definitions matching backend Prisma schema

export type Role = 'USER' | 'ADMIN';
export type TravelStyle = 'LUXURY' | 'BACKPACKING' | 'ADVENTURE' | 'FAMILY' | 'SOLO' | 'ROMANTIC' | 'BUSINESS' | 'GROUP';
export type TripPrivacy = 'PRIVATE' | 'PUBLIC' | 'SHARED';
export type TripStatus = 'PLANNING' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type ActivityCategory = 'ADVENTURE' | 'FOOD' | 'HISTORICAL' | 'SHOPPING' | 'NIGHTLIFE' | 'BEACHES' | 'HIKING' | 'CULTURAL' | 'TRANSPORT' | 'ACCOMMODATION' | 'OTHER';
export type PackingCategory = 'CLOTHES' | 'ELECTRONICS' | 'DOCUMENTS' | 'MEDICINES' | 'ACCESSORIES' | 'TOILETRIES' | 'OTHER';
export type NoteMood = 'HAPPY' | 'EXCITED' | 'NEUTRAL' | 'TIRED' | 'ADVENTUROUS' | 'RELAXED' | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  isEmailVerified: boolean;
  travelScore: number;
  tripsCount: number;
  countriesCount: number;
  language: string;
  timezone: string;
  createdAt: string;
  badges?: UserBadge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserBadge {
  id: string;
  badge: Badge;
  earnedAt: string;
}

export interface Activity {
  id: string;
  destinationId: string;
  title: string;
  description?: string;
  category: ActivityCategory;
  cost: number;
  currency: string;
  duration: number;
  startTime?: string;
  date?: string;
  address?: string;
  lat?: number;
  lng?: number;
  photoUrl?: string;
  rating?: number;
  notes?: string;
  bookingUrl?: string;
  order: number;
  createdAt: string;
}

export interface Destination {
  id: string;
  tripId: string;
  city: string;
  country: string;
  countryCode?: string;
  lat?: number;
  lng?: number;
  arrivalDate: string;
  departureDate: string;
  order: number;
  notes?: string;
  imageUrl?: string;
  timezone?: string;
  activities: Activity[];
  createdAt: string;
}

export interface Budget {
  id: string;
  tripId: string;
  flights: number;
  hotels: number;
  food: number;
  activities: number;
  transport: number;
  shopping: number;
  emergency: number;
  misc: number;
  currency: string;
  notes?: string;
}

export interface PackingItem {
  id: string;
  tripId: string;
  title: string;
  category: PackingCategory;
  packed: boolean;
  quantity: number;
  notes?: string;
  order: number;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  tripId?: string;
  title?: string;
  content: string;
  mood: NoteMood;
  photos: string[];
  tags: string[];
  date: string;
  createdAt: string;
  trip?: { id: string; title: string };
}

export interface SharedTrip {
  id: string;
  tripId: string;
  publicSlug: string;
  views: number;
  likes: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  travelStyle: TravelStyle;
  privacy: TripPrivacy;
  status: TripStatus;
  travelersCount: number;
  isArchived: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  destinations: Destination[];
  budget_items?: Budget;
  packingItems?: PackingItem[];
  notes?: Note[];
  sharedTrip?: SharedTrip;
  _count?: { destinations: number; packingItems: number };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}
