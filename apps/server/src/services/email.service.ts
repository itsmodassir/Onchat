import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { prisma } from '../utils/db';

export const emailService = {
  async getTransporter() {
    const configs = await (prisma as any).systemConfig.findMany();
    const configMap = configs.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const host = configMap['SMTP_HOST'] || process.env.SMTP_HOST || 'smtp.resend.com';
    const port = parseInt(configMap['SMTP_PORT'] || process.env.SMTP_PORT || '587');
    const user = configMap['SMTP_USER'] || process.env.SMTP_USER || 'resend';
    const pass = configMap['SMTP_PASS'] || process.env.SMTP_PASS;
    const from = configMap['SMTP_FROM'] || process.env.SMTP_FROM || 'noreply@onchat.fun';

    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        auth: { user, pass },
      }),
      from: `Onchat <${from}>`
    };
  },

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const { transporter, from } = await this.getTransporter();
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return true;
    } catch (error: any) {
      const errorMsg = error?.response || error?.message || error;
      logger.error(`SMTP_ERROR sending email to ${to}: ${JSON.stringify(errorMsg)}`);
      throw new Error(`SMTP_FAILURE: ${errorMsg}`);
    }
  },

  async sendOtpEmail(to: string, code: string, purpose: string) {
    // Explicitly log the OTP to the terminal for debugging if email delivery fails
    console.log(`\n\x1b[33m[AUTH_PROTOCOL] \x1b[0mOTP code for \x1b[36m${to}\x1b[0m (\x1b[35m${purpose}\x1b[0m): \x1b[32m${code}\x1b[0m\n`);
    
    let subject = 'Your Onchat OTP Code';
    let message = `Your OTP code is <b>${code}</b>. It is valid for 10 minutes.`;

    if (purpose === 'SIGNUP') {
      subject = 'Welcome to Onchat - Verify your email';
      message = `Thank you for signing up! Your verification code is <b style="font-size: 24px;">${code}</b>.<br/>It expires in 10 minutes.`;
    } else if (purpose === 'LOGIN') {
      subject = 'Onchat Login OTP';
      message = `Your login code is <b style="font-size: 24px;">${code}</b>. Do not share this with anyone.`;
    } else if (purpose === 'RESET_PASSWORD') {
      subject = 'Onchat Password Reset';
      message = `You requested a password reset. Your OTP is <b style="font-size: 24px;">${code}</b>.`;
    }

    return await this.sendEmail(to, subject, message);
  }
};
