import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;

    // Check if user is banned
    const user = await (prisma.user as any).findUnique({
      where: { id: decoded.userId },
      select: { isBanned: true, bannedUntil: true },
    });

    if (user?.isBanned) {
      // Auto-lift temp ban if expired
      if (user.bannedUntil && user.bannedUntil < new Date()) {
        await (prisma.user as any).update({
          where: { id: decoded.userId },
          data: { isBanned: false, bannedUntil: null },
        });
      } else {
        return res.status(403).json({
          error: 'Your account has been banned.',
          bannedUntil: user.bannedUntil,
        });
      }
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const adminMiddleware = (req: any, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};
