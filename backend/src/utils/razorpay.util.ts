import Razorpay from 'razorpay';
import { validateEnvironment } from '../config/env.validation';

const env = validateEnvironment();

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export default razorpay;
