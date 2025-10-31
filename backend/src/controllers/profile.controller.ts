import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/express';

export class ProfileController {
  public static getProfile(req: AuthenticatedRequest, res: Response): void {
    // The user object is attached to the request by the authenticate middleware
    const { password, ...userProfile } = req.user!;
    res.json(userProfile);
  }
}
