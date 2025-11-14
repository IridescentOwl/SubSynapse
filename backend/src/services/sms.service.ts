import twilio from 'twilio';
import { config } from 'dotenv';

config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export class SmsService {
  public static async sendSms(to: string, body: string): Promise<void> {
    try {
      await client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });
      console.log(`SMS sent to ${to}`);
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new Error('SMS could not be sent.');
    }
  }
}
