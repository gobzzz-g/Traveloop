import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';

// Mock the prisma client
jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid-email' });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 401 for invalid credentials', async () => {
      // Mock user not found
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });
      
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});
