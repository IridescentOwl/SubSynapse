import cron from 'node-cron';
import { SuspiciousActivityService } from '../services/suspiciousActivity.service';

export const startSuspiciousActivityCheck = () => {
  cron.schedule('0 0 * * *', () => {
    SuspiciousActivityService.checkForSuspiciousActivity();
  });
};
