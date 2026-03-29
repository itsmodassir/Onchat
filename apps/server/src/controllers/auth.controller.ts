import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { otpService } from '../services/otp.service';

export const authController = {
  async sendOtp(req: Request, res: Response) {
    try {
      const { email, purpose } = req.body; // purpose should be SIGNUP, LOGIN, RESET_PASSWORD
      if (!email || !purpose) throw new Error('Email and purpose are required.');
      await otpService.sendOtp(email, purpose);
      res.json({ message: 'OTP sent successfully.' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async signup(req: Request, res: Response) {
    try {
      const { name, email, password, otp } = req.body;
      if (!otp) throw new Error('OTP is required for signup.');
      const user = await authService.signup(name, email, password, otp);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password, otp } = req.body;
      const result = await authService.login(email, password, otp);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) throw new Error('Email, OTP, and new password are required.');
      const result = await authService.resetPassword(email, otp, newPassword);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateProfile(req: any, res: Response) {
    try {
      const { name, avatar } = req.body;
      const user = await authService.updateProfile(req.user.userId, { name, avatar });
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async savePushToken(req: any, res: Response) {
    try {
      const { token } = req.body;
      if (!token) throw new Error('Token is required');
      await authService.savePushToken(req.user.userId, token);
      res.json({ success: true, message: 'Push token registered successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async setupAdmin(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      const hashedPassword = await require('bcryptjs').hash(password, 10);
      const shortId = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const user = await (require('../utils/db').prisma.user as any).upsert({
        where: { email },
        update: { password: hashedPassword, isAdmin: true },
        create: { email, name, password: hashedPassword, isAdmin: true, shortId }
      });
      res.json({ message: 'Admin setup successful', email: user.email });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async me(req: any, res: Response) {
    try {
      const user = await authService.me(req.user.userId);
      res.json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },
};
