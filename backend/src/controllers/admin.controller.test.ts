import { Request, Response } from 'express';
import { AdminController } from './admin.controller';
import { AdminService } from '../services/admin.service';

jest.mock('../services/admin.service');

describe('AdminController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
    };
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      req.body = { email: 'admin@example.com', password: 'password123' };
      (AdminService.login as jest.Mock).mockResolvedValue({ token: 'test-token' });

      await AdminController.login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ token: 'test-token' });
    });

    it('should return a 401 for invalid credentials', async () => {
      req.body = { email: 'admin@example.com', password: 'wrong-password' };
      (AdminService.login as jest.Mock).mockResolvedValue(null);

      await AdminController.login(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard stats', async () => {
      const stats = { pendingGroups: 5 };
      (AdminService.getDashboardStats as jest.Mock).mockResolvedValue(stats);

      await AdminController.getDashboardStats(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(stats);
    });
  });
});
