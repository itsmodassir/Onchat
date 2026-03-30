import { prisma } from '../utils/db';
import { emailService } from './email.service';
import { logger } from '../utils/logger';

const OTP_EXPIRY_MINUTES = 10;

export const otpService = {
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  async sendOtp(email: string, purpose: string) {
    // Check if user exists for LOGIN or RESET_PASSWORD
    if (purpose === 'LOGIN' || purpose === 'RESET_PASSWORD') {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('User with this email does not exist.');
    }
    
    if (purpose === 'SIGNUP') {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) throw new Error('Email is already registered. Please login.');
    }

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

    // Delete existing valid OTPs for this email and purpose
    await (prisma as any).otp.deleteMany({
      where: { email, purpose }
    });

    const otp = await (prisma as any).otp.create({
      data: {
        email,
        code,
        purpose,
        expiresAt
      }
    });

    // Run email delivery without awaiting to prevent UI timeouts
    emailService.sendOtpEmail(email, code, purpose).catch(err => {
      logger.error(`[ASYNC_OTP_ERROR] Background delivery failed for ${email}: ${err.message}`);
    });

    return otp;
  },

  async verifyOtp(email: string, code: string, purpose: string) {
    const otp = await (prisma as any).otp.findFirst({
      where: {
        email,
        code,
        purpose,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otp) {
      return { valid: false, message: 'Invalid OTP code.' };
    }

    if (otp.expiresAt < new Date()) {
      return { valid: false, message: 'OTP has expired.' };
    }

    // Optional: burn the OTP after successful verification
    await (prisma as any).otp.delete({ where: { id: otp.id } });

    return { valid: true };
  }
};
