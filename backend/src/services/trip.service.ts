import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { getPaginationParams, buildMeta } from '../utils/response';
import { Prisma, TravelStyle, TripPrivacy, TripStatus } from '@prisma/client';

export async function createTrip(userId: string, data: {
  title: string;
  description?: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  budget?: number;
  currency?: string;
  travelStyle?: TravelStyle;
  privacy?: TripPrivacy;
  travelersCount?: number;
  tags?: string[];
}) {
  const trip = await prisma.trip.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      coverImage: data.coverImage,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      budget: data.budget || 0,
      currency: data.currency || 'USD',
      travelStyle: data.travelStyle || 'SOLO',
      privacy: data.privacy || 'PRIVATE',
      travelersCount: data.travelersCount || 1,
      tags: data.tags ? data.tags.join(',') : "",
    },
    include: {
      destinations: { include: { activities: true } },
      budget_items: true,
    },
  });

  // Update user's trip count
  await prisma.user.update({
    where: { id: userId },
    data: { tripsCount: { increment: 1 } },
  });

  // Create empty budget record
  await prisma.budget.create({ data: { tripId: trip.id } });

  return trip;
}

export async function getTrips(
  userId: string,
  query: {
    page?: string;
    limit?: string;
    search?: string;
    status?: TripStatus;
    travelStyle?: TravelStyle;
    sortBy?: string;
    sortOrder?: string;
    archived?: string;
  }
) {
  const { skip, take, page, limit } = getPaginationParams(query.page, query.limit);

  const where: Prisma.TripWhereInput = {
    userId,
    isArchived: query.archived === 'true' ? true : query.archived === 'false' ? false : undefined,
    ...(query.search && {
      OR: [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ],
    }),
    ...(query.status && { status: query.status }),
    ...(query.travelStyle && { travelStyle: query.travelStyle }),
  };

  const orderBy: Prisma.TripOrderByWithRelationInput = {
    [(query.sortBy as string) || 'createdAt']: query.sortOrder || 'desc',
  };

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        destinations: {
          select: { id: true, city: true, country: true, imageUrl: true },
          orderBy: { order: 'asc' },
        },
        budget_items: { select: { id: true } },
        _count: { select: { destinations: true, packingItems: true } },
      },
    }),
    prisma.trip.count({ where }),
  ]);

  const formattedTrips = trips.map(t => ({
    ...t,
    tags: t.tags ? t.tags.split(',').filter(Boolean) : []
  }));

  return { trips: formattedTrips, meta: buildMeta(total, page, limit) };
}

export async function getTripById(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    include: {
      destinations: {
        orderBy: { order: 'asc' },
        include: {
          activities: { orderBy: { order: 'asc' } },
        },
      },
      budget_items: true,
      packingItems: { orderBy: { order: 'asc' } },
      notes: { orderBy: { createdAt: 'desc' } },
      sharedTrip: true,
    },
  });

  if (!trip) throw new ApiError(404, 'Trip not found');
  
  return {
    ...trip,
    tags: trip.tags ? trip.tags.split(',').filter(Boolean) : []
  };
}

export async function updateTrip(tripId: string, userId: string, data: Partial<{
  title: string;
  description: string;
  coverImage: string | null;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  travelStyle: TravelStyle;
  privacy: TripPrivacy;
  travelersCount: number;
  tags: string[];
  isArchived: boolean;
  status: TripStatus;
}>) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) throw new ApiError(404, 'Trip not found');

  const updated = await prisma.trip.update({
    where: { id: tripId },
    data: {
      ...data,
      tags: data.tags ? data.tags.join(',') : undefined,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
    include: {
      destinations: { include: { activities: true } },
      budget_items: true,
    },
  });
  
  return {
    ...updated,
    tags: updated.tags ? updated.tags.split(',').filter(Boolean) : []
  };
}

export async function deleteTrip(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) throw new ApiError(404, 'Trip not found');

  await prisma.trip.delete({ where: { id: tripId } });
  await prisma.user.update({
    where: { id: userId },
    data: { tripsCount: { decrement: 1 } },
  });
}

export async function duplicateTrip(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    include: {
      destinations: { include: { activities: true } },
      budget_items: true,
      packingItems: true,
    },
  });

  if (!trip) throw new ApiError(404, 'Trip not found');

  const newTrip = await prisma.trip.create({
    data: {
      userId,
      title: `${trip.title} (Copy)`,
      description: trip.description,
      coverImage: trip.coverImage,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.budget,
      currency: trip.currency,
      travelStyle: trip.travelStyle,
      privacy: 'PRIVATE',
      travelersCount: trip.travelersCount,
      tags: trip.tags,
    },
  });

  // Clone destinations and activities
  for (const dest of trip.destinations) {
    const newDest = await prisma.destination.create({
      data: {
        tripId: newTrip.id,
        city: dest.city,
        country: dest.country,
        countryCode: dest.countryCode,
        lat: dest.lat,
        lng: dest.lng,
        arrivalDate: dest.arrivalDate,
        departureDate: dest.departureDate,
        order: dest.order,
        notes: dest.notes,
        imageUrl: dest.imageUrl,
      },
    });

    for (const activity of dest.activities) {
      await prisma.activity.create({
        data: {
          destinationId: newDest.id,
          title: activity.title,
          description: activity.description,
          category: activity.category,
          cost: activity.cost,
          duration: activity.duration,
          startTime: activity.startTime,
          notes: activity.notes,
          order: activity.order,
        },
      });
    }
  }

  // Clone budget
  if (trip.budget_items) {
    await prisma.budget.create({
      data: {
        tripId: newTrip.id,
        flights: trip.budget_items.flights,
        hotels: trip.budget_items.hotels,
        food: trip.budget_items.food,
        activities: trip.budget_items.activities,
        transport: trip.budget_items.transport,
        shopping: trip.budget_items.shopping,
        emergency: trip.budget_items.emergency,
        misc: trip.budget_items.misc,
      },
    });
  } else {
    await prisma.budget.create({ data: { tripId: newTrip.id } });
  }

  // Clone packing items
  for (const item of trip.packingItems) {
    await prisma.packingItem.create({
      data: {
        tripId: newTrip.id,
        title: item.title,
        category: item.category,
        quantity: item.quantity,
        order: item.order,
      },
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { tripsCount: { increment: 1 } },
  });

  return {
    ...newTrip,
    tags: newTrip.tags ? newTrip.tags.split(',').filter(Boolean) : []
  };
}

export async function getTripStats(userId: string) {
  const [total, byStatus, totalBudget, upcomingTrips] = await Promise.all([
    prisma.trip.count({ where: { userId } }),
    prisma.trip.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    }),
    prisma.trip.aggregate({
      where: { userId },
      _sum: { budget: true },
    }),
    prisma.trip.findMany({
      where: { userId, startDate: { gte: new Date() }, isArchived: false },
      orderBy: { startDate: 'asc' },
      take: 3,
      include: {
        destinations: { select: { city: true, country: true }, take: 1 },
      },
    }),
  ]);

  return {
    total,
    byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
    totalBudget: totalBudget._sum.budget || 0,
    upcomingTrips,
  };
}
