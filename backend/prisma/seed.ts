import { PrismaClient, Role, TravelStyle, TripPrivacy, TripStatus, ActivityCategory, PackingCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up
  await prisma.analytics.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.savedTrip.deleteMany();
  await prisma.sharedTrip.deleteMany();
  await prisma.note.deleteMany();
  await prisma.packingItem.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();

  // Create badges
  const badges = await Promise.all([
    prisma.badge.create({ data: { name: 'First Trip', description: 'Created your first trip', icon: '✈️', condition: 'trips_count >= 1' } }),
    prisma.badge.create({ data: { name: 'Explorer', description: 'Visited 5 different countries', icon: '🌍', condition: 'countries_count >= 5' } }),
    prisma.badge.create({ data: { name: 'Planner Pro', description: 'Created 10 trips', icon: '📋', condition: 'trips_count >= 10' } }),
    prisma.badge.create({ data: { name: 'Budget Master', description: 'Set budgets for 5 trips', icon: '💰', condition: 'budget_trips >= 5' } }),
  ]);

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@traveloop.com',
      password: adminPassword,
      role: Role.ADMIN,
      isEmailVerified: true,
      travelScore: 1000,
      tripsCount: 5,
      countriesCount: 12,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  // Create demo user
  const userPassword = await bcrypt.hash('Demo@123', 12);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Alex Travel',
      email: 'demo@traveloop.com',
      password: userPassword,
      role: Role.USER,
      isEmailVerified: true,
      travelScore: 450,
      tripsCount: 2,
      countriesCount: 3,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    },
  });

  // Award badges
  await prisma.userBadge.create({ data: { userId: demoUser.id, badgeId: badges[0].id } });
  await prisma.userBadge.create({ data: { userId: admin.id, badgeId: badges[0].id } });
  await prisma.userBadge.create({ data: { userId: admin.id, badgeId: badges[1].id } });

  // Create demo trip 1
  const trip1 = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      title: 'European Adventure',
      description: 'An unforgettable 14-day journey through the heart of Europe — art, food, history, and culture.',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-14'),
      budget: 5000,
      currency: 'USD',
      travelStyle: TravelStyle.ADVENTURE,
      privacy: TripPrivacy.PUBLIC,
      status: TripStatus.UPCOMING,
      travelersCount: 2,
      tags: ['europe', 'adventure', 'culture'],
      coverImage: 'https://picsum.photos/seed/paris/1200/600',
    },
  });

  // Budget for trip1
  await prisma.budget.create({
    data: {
      tripId: trip1.id,
      flights: 1200,
      hotels: 1400,
      food: 700,
      activities: 600,
      transport: 400,
      shopping: 400,
      emergency: 300,
    },
  });

  // Destinations for trip1
  const paris = await prisma.destination.create({
    data: {
      tripId: trip1.id,
      city: 'Paris',
      country: 'France',
      countryCode: 'FR',
      lat: 48.8566,
      lng: 2.3522,
      arrivalDate: new Date('2026-06-01'),
      departureDate: new Date('2026-06-05'),
      order: 0,
      imageUrl: 'https://picsum.photos/seed/paris/800/400',
      timezone: 'Europe/Paris',
    },
  });

  await prisma.activity.create({
    data: {
      destinationId: paris.id,
      title: 'Eiffel Tower Visit',
      description: 'Visit the iconic Eiffel Tower and enjoy panoramic views of Paris.',
      category: ActivityCategory.HISTORICAL,
      cost: 26,
      duration: 120,
      startTime: '10:00',
      address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris',
      rating: 4.8,
      order: 0,
    },
  });

  await prisma.activity.create({
    data: {
      destinationId: paris.id,
      title: 'Louvre Museum',
      description: 'Explore the world\'s largest art museum and discover the Mona Lisa.',
      category: ActivityCategory.CULTURAL,
      cost: 17,
      duration: 180,
      startTime: '14:00',
      address: 'Rue de Rivoli, 75001 Paris',
      rating: 4.7,
      order: 1,
    },
  });

  const rome = await prisma.destination.create({
    data: {
      tripId: trip1.id,
      city: 'Rome',
      country: 'Italy',
      countryCode: 'IT',
      lat: 41.9028,
      lng: 12.4964,
      arrivalDate: new Date('2026-06-05'),
      departureDate: new Date('2026-06-09'),
      order: 1,
      imageUrl: 'https://picsum.photos/seed/rome/800/400',
      timezone: 'Europe/Rome',
    },
  });

  await prisma.activity.create({
    data: {
      destinationId: rome.id,
      title: 'Colosseum Tour',
      description: 'Walk through history in the iconic Roman Colosseum.',
      category: ActivityCategory.HISTORICAL,
      cost: 16,
      duration: 150,
      startTime: '09:00',
      address: 'Piazza del Colosseo, 1, 00184 Roma',
      rating: 4.9,
      order: 0,
    },
  });

  const barcelona = await prisma.destination.create({
    data: {
      tripId: trip1.id,
      city: 'Barcelona',
      country: 'Spain',
      countryCode: 'ES',
      lat: 41.3851,
      lng: 2.1734,
      arrivalDate: new Date('2026-06-09'),
      departureDate: new Date('2026-06-14'),
      order: 2,
      imageUrl: 'https://picsum.photos/seed/barcelona/800/400',
      timezone: 'Europe/Madrid',
    },
  });

  await prisma.activity.create({
    data: {
      destinationId: barcelona.id,
      title: 'Sagrada Família',
      description: 'Marvel at Gaudí\'s breathtaking unfinished basilica.',
      category: ActivityCategory.HISTORICAL,
      cost: 26,
      duration: 120,
      startTime: '10:00',
      address: 'C/ de Mallorca, 401, 08013 Barcelona',
      rating: 4.9,
      order: 0,
    },
  });

  // Packing list for trip1
  const packingItems = [
    { title: 'Passport', category: PackingCategory.DOCUMENTS, quantity: 1 },
    { title: 'Travel Insurance Documents', category: PackingCategory.DOCUMENTS, quantity: 1 },
    { title: 'Phone Charger', category: PackingCategory.ELECTRONICS, quantity: 1 },
    { title: 'Universal Adapter', category: PackingCategory.ELECTRONICS, quantity: 1 },
    { title: 'T-Shirts', category: PackingCategory.CLOTHES, quantity: 5 },
    { title: 'Comfortable Walking Shoes', category: PackingCategory.CLOTHES, quantity: 1 },
    { title: 'Sunscreen', category: PackingCategory.TOILETRIES, quantity: 1 },
    { title: 'Pain Relievers', category: PackingCategory.MEDICINES, quantity: 1 },
  ];

  for (let i = 0; i < packingItems.length; i++) {
    await prisma.packingItem.create({
      data: { tripId: trip1.id, ...packingItems[i], order: i },
    });
  }

  // Create shared link for trip1
  await prisma.sharedTrip.create({
    data: {
      tripId: trip1.id,
      publicSlug: 'european-adventure-demo',
      views: 142,
      likes: 37,
    },
  });

  // Create demo trip 2
  const trip2 = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      title: 'Bali Bliss',
      description: 'A serene week in Bali — temples, rice terraces, and beach sunsets.',
      startDate: new Date('2026-08-15'),
      endDate: new Date('2026-08-22'),
      budget: 2500,
      currency: 'USD',
      travelStyle: TravelStyle.SOLO,
      privacy: TripPrivacy.PRIVATE,
      status: TripStatus.PLANNING,
      travelersCount: 1,
      tags: ['bali', 'solo', 'beach'],
      coverImage: 'https://picsum.photos/seed/bali/1200/600',
    },
  });

  await prisma.budget.create({
    data: {
      tripId: trip2.id,
      flights: 600,
      hotels: 700,
      food: 350,
      activities: 400,
      transport: 200,
      shopping: 150,
      emergency: 100,
    },
  });

  const bali = await prisma.destination.create({
    data: {
      tripId: trip2.id,
      city: 'Bali',
      country: 'Indonesia',
      countryCode: 'ID',
      lat: -8.3405,
      lng: 115.0920,
      arrivalDate: new Date('2026-08-15'),
      departureDate: new Date('2026-08-22'),
      order: 0,
      imageUrl: 'https://picsum.photos/seed/bali/800/400',
    },
  });

  await prisma.activity.create({
    data: {
      destinationId: bali.id,
      title: 'Tegalalang Rice Terrace',
      description: 'Walk through stunning UNESCO-listed rice terraces in Ubud.',
      category: ActivityCategory.ADVENTURE,
      cost: 5,
      duration: 120,
      startTime: '08:00',
      rating: 4.6,
      order: 0,
    },
  });

  // Notes
  await prisma.note.create({
    data: {
      userId: demoUser.id,
      tripId: trip1.id,
      title: 'Day 1 - Arrived in Paris!',
      content: 'Finally made it to the City of Light! The Eiffel Tower at night is absolutely magical. Can\'t believe I\'m actually here. Had the most amazing croissant this morning. Tomorrow we explore the Louvre!',
      mood: 'EXCITED',
      date: new Date('2026-06-01'),
    },
  });

  // Analytics seed data
  const metrics = ['daily_active_users', 'new_signups', 'trips_created', 'ai_requests'];
  for (const metric of metrics) {
    for (let i = 30; i >= 0; i--) {
      await prisma.analytics.create({
        data: {
          metric,
          value: Math.floor(Math.random() * 100) + 10,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin: admin@traveloop.com / Admin@123');
  console.log('👤 Demo:  demo@traveloop.com  / Demo@123');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
