import nodemailer from 'nodemailer';

// In a real app, you'd use a transport like SMTP with a real email service
// For development, we'll use a simple setup that logs to the console
const transport = nodemailer.createTransport({
  streamTransport: true,
  newline: 'unix',
  buffer: true,
});

export class EmailService {
  public static async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
    console.log(`Sending verification email to ${email}. Link: ${verificationLink}`);

    // In a real implementation, you would send an HTML email
    await transport.sendMail({
      from: 'no-reply@synapse.com',
      to: email,
      subject: 'Verify your Synapse account',
      text: `Click here to verify your account: ${verificationLink}`,
    });
  }

  public static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    console.log(`Sending password reset email to ${email}. Link: ${resetLink}`);

    await transport.sendMail({
      from: 'no-reply@synapse.com',
      to: email,
      subject: 'Reset your Synapse password',
      text: `Click here to reset your password: ${resetLink}`,
    });
  }
}
