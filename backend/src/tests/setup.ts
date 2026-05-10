import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

beforeAll(async () => {
  // Setup logic before all tests
});

afterAll(async () => {
  await prisma.$disconnect();
});
