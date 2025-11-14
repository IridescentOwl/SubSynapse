import sgMail from '@sendgrid/mail';
import { config } from 'dotenv';
import { renderTemplate } from '../utils/template.util';
import prisma from '../utils/prisma.singleton';
import jwt from 'jsonwebtoken';
import { validateEnvironment } from '../config/env.validation';

config();

const env = validateEnvironment();

// Only set SendGrid API key if it's valid
if (env.SENDGRID_API_KEY && 
    env.SENDGRID_API_KEY !== 'SG.placeholder_key' && 
    !env.SENDGRID_API_KEY.includes('placeholder')) {
  try {
    sgMail.setApiKey(env.SENDGRID_API_KEY);
    console.log('✅ SendGrid API key configured');
  } catch (error) {
    console.warn('⚠️  Failed to set SendGrid API key:', error);
  }
} else {
  console.warn('⚠️  SendGrid API key not configured or is placeholder. Email sending will be disabled.');
}

export class EmailService {
  private static async sendEmail(to: string, subject: string, body: string, essential = false): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email: to } });

    if (user && !essential && (user.notifications as any)?.email === false) {
      console.log(`Email to ${to} blocked due to user preferences.`);
      return;
    }

    const env = validateEnvironment();
    
    // Check if SendGrid is properly configured
    if (!env.SENDGRID_API_KEY || env.SENDGRID_API_KEY === 'SG.placeholder_key' || env.SENDGRID_API_KEY.includes('placeholder')) {
      console.warn(`⚠️  SendGrid API key not configured. Email not sent to ${to}`);
      console.warn(`   Subject: ${subject}`);
      if (env.NODE_ENV === 'development') {
        console.warn(`   Email body would be: ${body}`);
      }
      return; // Don't throw error, just skip email
    }

    const token = jwt.sign({ email: to }, env.JWT_SECRET, { expiresIn: '7d' });
    const unsubscribeLink = `${env.FRONTEND_URL}/unsubscribe?token=${token}`;
    const html = renderTemplate('base', { body, unsubscribeLink });

    const msg = {
      to,
      from: env.EMAIL_FROM,
      subject,
      html,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Email sent to ${to}`);
    } catch (error: any) {
      console.error('❌ Error sending email:', error.message || error);
      if (error?.response?.body) {
        console.error('SendGrid error details:', error.response.body);
      }
      
      // In development, log the email content instead of failing
      if (env.NODE_ENV === 'development') {
        console.warn(`⚠️  Email sending failed, but continuing. Email would have been:`);
        console.warn(`   To: ${to}`);
        console.warn(`   Subject: ${subject}`);
        console.warn(`   Body: ${body}`);
      }
      
      // Only throw error if email is essential AND we're in production
      if (essential && env.NODE_ENV === 'production') {
        throw new Error('Email could not be sent.');
      }
      
      // Otherwise, just log and continue
      console.warn(`⚠️  Email to ${to} failed, but operation continues`);
    }
  }

  public static async sendVerificationEmail(email: string, token: string): Promise<void> {
    const env = validateEnvironment();
    const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;
    const subject = 'Verify your Subsynapse account';
    const body = `<p>Click <a href="${verificationLink}">here</a> to verify your account.</p>`;

    await this.sendEmail(email, subject, body, true);
  }

  public static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const env = validateEnvironment();
    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
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
