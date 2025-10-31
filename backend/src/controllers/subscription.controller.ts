import { Request, Response } from 'express';
import { SubscriptionService } from '../services/subscription.service';
import { AuthenticatedRequest } from '../types/express';
import { log } from '../utils/logging.util';

export class SubscriptionController {
  public static async createSubscription(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { name, username, password } = req.body;
    const userId = req.user!.id;

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Name, username, and password are required' });
    }

    try {
      const subscription = await SubscriptionService.createSubscription(userId, name, username, password);
      return res.status(201).json(subscription);
    } catch (error) {
      log('error', 'An error occurred during subscription creation', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async getSubscriptions(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const userId = req.user!.id;

    try {
      const subscriptions = await SubscriptionService.getSubscriptions(userId);
      return res.status(200).json(subscriptions);
    } catch (error) {
      log('error', 'An error occurred while fetching subscriptions', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async getSubscription(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const userId = req.user!.id;
    const subscriptionId = req.params.id;

    try {
      const subscription = await SubscriptionService.getSubscription(userId, subscriptionId);
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }
      return res.status(200).json(subscription);
    } catch (error) {
      log('error', 'An error occurred while fetching a subscription', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async updateSubscription(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const userId = req.user!.id;
    const subscriptionId = req.params.id;
    const { name, username, password } = req.body;

    try {
      const subscription = await SubscriptionService.updateSubscription(userId, subscriptionId, name, username, password);
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }
      return res.status(200).json(subscription);
    } catch (error) {
      log('error', 'An error occurred while updating a subscription', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async deleteSubscription(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const userId = req.user!.id;
    const subscriptionId = req.params.id;

    try {
      await SubscriptionService.deleteSubscription(userId, subscriptionId);
      return res.status(204).send();
    } catch (error) {
      log('error', 'An error occurred while deleting a subscription', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
