import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';

export async function addDestination(tripId: string, userId: string, data: {
  city: string;
  country: string;
  countryCode?: string;
  lat?: number;
  lng?: number;
  arrivalDate: string;
  departureDate: string;
  notes?: string;
  imageUrl?: string;
  timezone?: string;
}) {
  // Verify trip ownership
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) throw new ApiError(404, 'Trip not found');

  const order = await prisma.destination.count({ where: { tripId } });

  return prisma.destination.create({
    data: {
      tripId,
      city: data.city,
      country: data.country,
      countryCode: data.countryCode,
      lat: data.lat,
      lng: data.lng,
      arrivalDate: new Date(data.arrivalDate),
      departureDate: new Date(data.departureDate),
      notes: data.notes,
      imageUrl: data.imageUrl,
      timezone: data.timezone,
      order,
    },
    include: { activities: true },
  });
}

export async function updateDestination(
  destId: string,
  userId: string,
  data: Partial<{
    city: string;
    country: string;
    countryCode: string;
    lat: number;
    lng: number;
    arrivalDate: string;
    departureDate: string;
    notes: string;
    imageUrl: string;
    order: number;
  }>
) {
  const dest = await prisma.destination.findFirst({
    where: { id: destId },
    include: { trip: { select: { userId: true } } },
  });
  if (!dest || dest.trip.userId !== userId) throw new ApiError(404, 'Destination not found');

  return prisma.destination.update({
    where: { id: destId },
    data: {
      ...data,
      arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : undefined,
      departureDate: data.departureDate ? new Date(data.departureDate) : undefined,
    },
    include: { activities: true },
  });
}

export async function deleteDestination(destId: string, userId: string) {
  const dest = await prisma.destination.findFirst({
    where: { id: destId },
    include: { trip: { select: { userId: true } } },
  });
  if (!dest || dest.trip.userId !== userId) throw new ApiError(404, 'Destination not found');
  await prisma.destination.delete({ where: { id: destId } });
}

export async function reorderDestinations(tripId: string, userId: string, orderedIds: string[]) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) throw new ApiError(404, 'Trip not found');

  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.destination.update({ where: { id }, data: { order: index } })
    )
  );
}
