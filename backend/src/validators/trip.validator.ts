import { z } from 'zod';

const TravelStyleEnum = z.enum([
  'LUXURY', 'BACKPACKING', 'ADVENTURE', 'FAMILY', 'SOLO', 'ROMANTIC', 'BUSINESS', 'GROUP'
]);

const TripPrivacyEnum = z.enum(['PRIVATE', 'PUBLIC', 'SHARED']);

export const createTripSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(2000).optional(),
    coverImage: z.string().url().optional(),
    startDate: z.string().datetime({ message: 'Invalid start date' }),
    endDate: z.string().datetime({ message: 'Invalid end date' }),
    budget: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    travelStyle: TravelStyleEnum.optional(),
    privacy: TripPrivacyEnum.optional(),
    travelersCount: z.number().min(1).max(100).optional(),
    tags: z.array(z.string()).optional(),
  }).refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { message: 'End date must be after or equal to start date', path: ['endDate'] }
  ),
});

export const updateTripSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    coverImage: z.string().url().optional().nullable(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    budget: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    travelStyle: TravelStyleEnum.optional(),
    privacy: TripPrivacyEnum.optional(),
    travelersCount: z.number().min(1).max(100).optional(),
    tags: z.array(z.string()).optional(),
    isArchived: z.boolean().optional(),
  }),
});

export const getTripSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const listTripsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.enum(['PLANNING', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
    travelStyle: TravelStyleEnum.optional(),
    sortBy: z.enum(['createdAt', 'startDate', 'title', 'budget']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    archived: z.enum(['true', 'false']).optional(),
  }),
});
