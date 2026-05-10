import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';

export async function getBudget(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    include: {
      budget_items: true,
      destinations: { include: { activities: { select: { cost: true, category: true } } } },
    },
  });
  if (!trip) throw new ApiError(404, 'Trip not found');

  // Calculate activity costs by category
  const activityTotals: Record<string, number> = {};
  for (const dest of trip.destinations) {
    for (const activity of dest.activities) {
      activityTotals[activity.category] =
        (activityTotals[activity.category] || 0) + activity.cost;
    }
  }

  const budget = trip.budget_items;
  const totalPlanned = budget
    ? budget.flights + budget.hotels + budget.food + budget.activities +
      budget.transport + budget.shopping + budget.emergency + budget.misc
    : 0;

  return {
    budget,
    totalBudget: trip.budget,
    totalPlanned,
    remaining: trip.budget - totalPlanned,
    activityBreakdown: activityTotals,
    utilizationPercentage: trip.budget > 0 ? (totalPlanned / trip.budget) * 100 : 0,
  };
}

export async function updateBudget(tripId: string, userId: string, data: {
  flights?: number;
  hotels?: number;
  food?: number;
  activities?: number;
  transport?: number;
  shopping?: number;
  emergency?: number;
  misc?: number;
  currency?: string;
  notes?: string;
}) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) throw new ApiError(404, 'Trip not found');

  return prisma.budget.upsert({
    where: { tripId },
    create: { tripId, ...data },
    update: data,
  });
}
