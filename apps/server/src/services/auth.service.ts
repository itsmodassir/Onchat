import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';
import { generateShortId } from '../utils/id';
import { otpService } from './otp.service';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const authService = {
  async signup(name: string, email: string, password: string, otp: string) {
    try {
      logger.info(`Signup attempt for email: ${email}`);
      const verification = await otpService.verifyOtp(email, otp, 'SIGNUP');
      if (!verification.valid) {
        throw new Error(verification.message || 'Invalid OTP');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const shortId = generateShortId();
      
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          shortId,
        } as any,
      });
      return user;
    } catch (error: any) {
      logger.error('SIGNUP_SERVICE_ERROR:', error);
      throw error;
    }
  },

  async login(email: string, password?: string, otp?: string) {
    logger.info(`Login attempt for email: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (otp) {
      const verification = await otpService.verifyOtp(email, otp, 'LOGIN');
      if (!verification.valid) {
        throw new Error(verification.message || 'Invalid OTP');
      }
    } else if (password && user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
    } else {
      throw new Error('Password or OTP is required');
    }

    const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    return { user, token };
  },

  async resetPassword(email: string, otp: string, newPassword: string) {
    const verification = await otpService.verifyOtp(email, otp, 'RESET_PASSWORD');
    if (!verification.valid) {
      throw new Error(verification.message || 'Invalid OTP');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await (prisma.user as any).update({
      where: { email },
      data: { password: hashedPassword },
    });
    return { success: true, message: 'Password updated successfully' };
  },

  async savePushToken(userId: string, token: string) {
    return await (prisma.user as any).update({
      where: { id: userId },
      data: { expoPushToken: token },
    });
  },

  async updateProfile(userId: string, data: { name?: string, avatar?: string }) {
    return await (prisma.user as any).update({
      where: { id: userId },
      data,
    });
  },

  async me(userId: string) {
    return await (prisma.user as any).findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            rooms: true,
            participants: true,
          },
        },
        family: {
          select: { id: true, name: true },
        },
        assets: {
          where: { isEquipped: true },
          include: { item: true },
          take: 5,
        },
      },
    });
  },
};
