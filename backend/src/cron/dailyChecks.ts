import cron from 'node-cron';
import { AlertsService } from '../services/alerts.service';

export const startDailyChecks = () => {
  cron.schedule('0 0 * * *', () => {
    AlertsService.checkSubscriptionsAndBalances();
  });
};
