import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { ActivityCategory } from '@prisma/client';

export async function addActivity(destinationId: string, userId: string, data: {
  title: string;
  description?: string;
  category?: ActivityCategory;
  cost?: number;
  currency?: string;
  duration?: number;
  startTime?: string;
  date?: string;
  address?: string;
  lat?: number;
  lng?: number;
  photoUrl?: string;
  rating?: number;
  notes?: string;
  bookingUrl?: string;
}) {
  const dest = await prisma.destination.findFirst({
    where: { id: destinationId },
    include: { trip: { select: { userId: true } } },
  });
  if (!dest || dest.trip.userId !== userId) throw new ApiError(404, 'Destination not found');

  const order = await prisma.activity.count({ where: { destinationId } });

  return prisma.activity.create({
    data: {
      destinationId,
      title: data.title,
      description: data.description,
      category: data.category || 'OTHER',
      cost: data.cost || 0,
      currency: data.currency || 'USD',
      duration: data.duration || 60,
      startTime: data.startTime,
      date: data.date ? new Date(data.date) : undefined,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
      photoUrl: data.photoUrl,
      rating: data.rating,
      notes: data.notes,
      bookingUrl: data.bookingUrl,
      order,
    },
  });
}

export async function updateActivity(activityId: string, userId: string, data: Partial<{
  title: string;
  description: string;
  category: ActivityCategory;
  cost: number;
  duration: number;
  startTime: string;
  date: string;
  address: string;
  notes: string;
  order: number;
  photoUrl: string;
  bookingUrl: string;
}>) {
  const activity = await prisma.activity.findFirst({
    where: { id: activityId },
    include: { destination: { include: { trip: { select: { userId: true } } } } },
  });
  if (!activity || activity.destination.trip.userId !== userId) {
    throw new ApiError(404, 'Activity not found');
  }

  return prisma.activity.update({
    where: { id: activityId },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    },
  });
}

export async function deleteActivity(activityId: string, userId: string) {
  const activity = await prisma.activity.findFirst({
    where: { id: activityId },
    include: { destination: { include: { trip: { select: { userId: true } } } } },
  });
  if (!activity || activity.destination.trip.userId !== userId) {
    throw new ApiError(404, 'Activity not found');
  }
  await prisma.activity.delete({ where: { id: activityId } });
}

export async function reorderActivities(destinationId: string, userId: string, orderedIds: string[]) {
  const dest = await prisma.destination.findFirst({
    where: { id: destinationId },
    include: { trip: { select: { userId: true } } },
  });
  if (!dest || dest.trip.userId !== userId) throw new ApiError(404, 'Destination not found');

  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.activity.update({ where: { id }, data: { order: index } })
    )
  );
}
