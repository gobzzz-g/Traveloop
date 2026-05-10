import { prisma } from '../lib/prisma';

export async function getAdminStats() {
  const [
    totalUsers,
    totalTrips,
    totalDestinations,
    totalActivities,
    recentUsers,
    popularDestinations,
    tripsByStyle,
    tripsByStatus,
    monthlySignups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.destination.count(),
    prisma.activity.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, name: true, email: true, avatar: true, tripsCount: true, createdAt: true, role: true },
    }),
    prisma.destination.groupBy({
      by: ['city', 'country'],
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 10,
    }),
    prisma.trip.groupBy({
      by: ['travelStyle'],
      _count: true,
    }),
    prisma.trip.groupBy({
      by: ['status'],
      _count: true,
    }),
    // Monthly signups (last 6 months)
    prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as month,
             COUNT(*)::bigint as count
      FROM users
      WHERE "createdAt" > NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `,
  ]);

  return {
    overview: { totalUsers, totalTrips, totalDestinations, totalActivities },
    recentUsers,
    popularDestinations: popularDestinations.map((d) => ({
      city: d.city,
      country: d.country,
      count: d._count.city,
    })),
    tripsByStyle: tripsByStyle.reduce((acc: Record<string, number>, s) => {
      acc[s.travelStyle] = s._count;
      return acc;
    }, {}),
    tripsByStatus: tripsByStatus.reduce((acc: Record<string, number>, s) => {
      acc[s.status] = s._count;
      return acc;
    }, {}),
    monthlySignups: monthlySignups.map((m) => ({ month: m.month, count: Number(m.count) })),
  };
}

export async function getAllUsers(page: string = '1', limit: string = '20', search?: string) {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, avatar: true, role: true,
        isEmailVerified: true, tripsCount: true, createdAt: true, travelScore: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } };
}

export async function updateUserRole(userId: string, role: 'USER' | 'ADMIN') {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function deleteUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}
