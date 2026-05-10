import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { v4 as uuidv4 } from 'uuid';

export async function createShareLink(tripId: string, userId: string, expiresInDays?: number) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) throw new ApiError(404, 'Trip not found');

  const publicSlug = uuidv4().replace(/-/g, '').substring(0, 12);
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const shared = await prisma.sharedTrip.upsert({
    where: { tripId },
    create: { tripId, publicSlug, expiresAt },
    update: { isActive: true, expiresAt },
  });

  // Make trip public
  await prisma.trip.update({
    where: { id: tripId },
    data: { privacy: 'PUBLIC' },
  });

  return shared;
}

export async function getSharedTrip(slug: string) {
  const shared = await prisma.sharedTrip.findFirst({
    where: {
      publicSlug: slug,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      trip: {
        include: {
          user: { select: { name: true, avatar: true } },
          destinations: {
            orderBy: { order: 'asc' },
            include: { activities: { orderBy: { order: 'asc' } } },
          },
          budget_items: true,
        },
      },
    },
  });

  if (!shared) throw new ApiError(404, 'Shared trip not found or has expired');

  // Increment view count
  await prisma.sharedTrip.update({
    where: { id: shared.id },
    data: { views: { increment: 1 } },
  });

  return shared;
}

export async function likeSharedTrip(slug: string) {
  const shared = await prisma.sharedTrip.findFirst({
    where: { publicSlug: slug, isActive: true },
  });
  if (!shared) throw new ApiError(404, 'Shared trip not found');

  return prisma.sharedTrip.update({
    where: { id: shared.id },
    data: { likes: { increment: 1 } },
  });
}

export async function deactivateShare(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) throw new ApiError(404, 'Trip not found');

  await prisma.sharedTrip.updateMany({
    where: { tripId },
    data: { isActive: false },
  });

  await prisma.trip.update({
    where: { id: tripId },
    data: { privacy: 'PRIVATE' },
  });
}

export async function getPublicTrips(page: string = '1', limit: string = '12', search?: string) {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where = {
    trip: {
      privacy: 'PUBLIC' as const,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { destinations: { some: { city: { contains: search, mode: 'insensitive' as const } } } },
        ],
      }),
    },
    isActive: true,
  };

  const [sharedTrips, total] = await Promise.all([
    prisma.sharedTrip.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { views: 'desc' },
      include: {
        trip: {
          include: {
            user: { select: { name: true, avatar: true } },
            destinations: { select: { city: true, country: true, imageUrl: true }, take: 1 },
            _count: { select: { destinations: true } },
          },
        },
      },
    }),
    prisma.sharedTrip.count({ where }),
  ]);

  return {
    trips: sharedTrips,
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  };
}
