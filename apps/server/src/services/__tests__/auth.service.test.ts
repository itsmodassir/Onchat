import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../auth.service';
import { prisma } from '../../utils/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

vi.mock('../../utils/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const result = await authService.login('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBeDefined();
    });

    it('should throw error for non-existent user', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(authService.login('wrong@example.com', 'pwd'))
        .rejects.toThrow('Invalid credentials');
    });
  });
});
