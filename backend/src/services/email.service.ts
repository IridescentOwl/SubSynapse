import sgMail from '@sendgrid/mail';
import { config } from 'dotenv';
import { renderTemplate } from '../utils/template.util';
import prisma from '../utils/prisma.util';
import jwt from 'jsonwebtoken';

config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export class EmailService {
  private static async sendEmail(to: string, subject: string, body: string, essential = false): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email: to } });

    if (user && !essential && (user.notifications as any)?.email === false) {
      console.log(`Email to ${to} blocked due to user preferences.`);
      return;
    }

    const token = jwt.sign({ email: to }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    const unsubscribeLink = `${process.env.FRONTEND_URL}/unsubscribe?token=${token}`;
    const html = renderTemplate('base', { body, unsubscribeLink });

    const msg = {
      to,
      from: process.env.EMAIL_FROM as string,
      subject,
      html,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      throw new Error('Email could not be sent.');
    }
  }

  public static async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const subject = 'Verify your Subsynapse account';
    const body = `<p>Click <a href="${verificationLink}">here</a> to verify your account.</p>`;

    await this.sendEmail(email, subject, body, true);
  }

  public static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const subject = 'Reset your Subsynapse password';
    const body = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;

    await this.sendEmail(email, subject, body, true);
  }

  public static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = 'Welcome to Subsynapse!';
    const body = `<p>Hi ${name},</p><p>Welcome to Subsynapse! We're excited to have you on board.</p>`;

    await this.sendEmail(email, subject, body);
  }

  public static async sendPaymentConfirmationEmail(email: string, amount: number, transactionId: string): Promise<void> {
    const subject = 'Payment Confirmation';
    const body = `<p>Your payment of ${amount} has been successfully processed.</p><p>Transaction ID: ${transactionId}</p>`;

    await this.sendEmail(email, subject, body);
  }

  public static async sendGroupJoinedEmail(email: string, groupName: string): Promise<void> {
    const subject = `Successfully joined ${groupName}`;
    const body = `<p>You have successfully joined the group: ${groupName}.</p>`;

    await this.sendEmail(email, subject, body);
  }

  public static async sendGroupLeftEmail(email: string, groupName: string): Promise<void> {
    const subject = `Successfully left ${groupName}`;
    const body = `<p>You have successfully left the group: ${groupName}.</p>`;

    await this.sendEmail(email, subject, body);
  }

  public static async sendWithdrawalConfirmationEmail(email: string, amount: number): Promise<void> {
    const subject = 'Withdrawal Request Confirmation';
    const body = `<p>Your withdrawal request for ${amount} has been received and is being processed.</p>`;

    await this.sendEmail(email, subject, body);
  }

  public static async sendSubscriptionExpiryWarning(email: string, groupName: string, expiryDate: Date): Promise<void> {
    const subject = `Your subscription to ${groupName} is expiring soon`;
    const body = `<p>Your subscription to ${groupName} will expire on ${expiryDate.toDateString()}.</p>`;

    await this.sendEmail(email, subject, body);
  }

  public static async sendLowBalanceAlert(email: string, balance: number): Promise<void> {
    const subject = 'Low Balance Alert';
    const body = `<p>Your credit balance is low. Your current balance is ${balance}.</p>`;

    await this.sendEmail(email, subject, body);
  }

  public static async sendSuspiciousActivityAlert(adminEmail: string, activity: string): Promise<void> {
    const subject = 'Suspicious Activity Detected';
    const body = `<p>Suspicious activity has been detected:</p><p>${activity}</p>`;

    await this.sendEmail(adminEmail, subject, body);
  }
}
