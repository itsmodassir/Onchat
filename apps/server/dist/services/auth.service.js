import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
export const authService = {
    async signup(name, email, password) {
        logger.info(`Signup attempt for email: ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        return user;
    },
    async login(email, password) {
        logger.info(`Login attempt for email: ${email}`);
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user || !user.password) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        return { user, token };
    },
    async me(userId) {
        return await prisma.user.findUnique({
            where: { id: userId },
            include: {
                rooms: true,
                transactions: true,
            },
        });
    },
};
