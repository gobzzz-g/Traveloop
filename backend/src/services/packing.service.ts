import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { PackingCategory } from '@prisma/client';

export async function getPackingItems(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) throw new ApiError(404, 'Trip not found');

  const items = await prisma.packingItem.findMany({
    where: { tripId },
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });

  // Group by category
  const grouped = items.reduce((acc: Record<string, typeof items>, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const totalItems = items.length;
  const packedItems = items.filter((i) => i.packed).length;

  return { items, grouped, totalItems, packedItems, completionPercentage: totalItems > 0 ? (packedItems / totalItems) * 100 : 0 };
}

export async function addPackingItem(tripId: string, userId: string, data: {
  title: string;
  category?: PackingCategory;
  quantity?: number;
  notes?: string;
}) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) throw new ApiError(404, 'Trip not found');

  const order = await prisma.packingItem.count({ where: { tripId } });

  return prisma.packingItem.create({
    data: {
      tripId,
      title: data.title,
      category: data.category || 'OTHER',
      quantity: data.quantity || 1,
      notes: data.notes,
      order,
    },
  });
}

export async function updatePackingItem(itemId: string, userId: string, data: Partial<{
  title: string;
  category: PackingCategory;
  packed: boolean;
  quantity: number;
  notes: string;
  order: number;
}>) {
  const item = await prisma.packingItem.findFirst({
    where: { id: itemId },
    include: { trip: { select: { userId: true } } },
  });
  if (!item || item.trip.userId !== userId) throw new ApiError(404, 'Item not found');

  return prisma.packingItem.update({ where: { id: itemId }, data });
}

export async function deletePackingItem(itemId: string, userId: string) {
  const item = await prisma.packingItem.findFirst({
    where: { id: itemId },
    include: { trip: { select: { userId: true } } },
  });
  if (!item || item.trip.userId !== userId) throw new ApiError(404, 'Item not found');
  await prisma.packingItem.delete({ where: { id: itemId } });
}

export async function bulkAddItems(tripId: string, userId: string, items: { title: string; category: PackingCategory }[]) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) throw new ApiError(404, 'Trip not found');

  const existingCount = await prisma.packingItem.count({ where: { tripId } });

  return prisma.packingItem.createMany({
    data: items.map((item, index) => ({
      tripId,
      title: item.title,
      category: item.category || 'OTHER',
      order: existingCount + index,
    })),
  });
}
