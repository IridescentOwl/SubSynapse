import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateAddCredits = [
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
    body('currency').isString().notEmpty().withMessage('Currency is required.'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

export const validateCredentials = [
    body('credentials').notEmpty().withMessage('Credentials are required.'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

export const validateForgotPassword = [
    body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

export const validateLogin = [
    body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

export const validateOtp = [
    body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
    body('otp').isString().notEmpty().withMessage('OTP is required.'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

export const validateRegistration = [
  body('email')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail()
    .custom((value) => {
      if (!value.endsWith('@thapar.edu')) {
        throw new Error('Only @thapar.edu emails are allowed');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/\d/).withMessage('Password must contain at least one number.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.'),
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long.'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Format errors for better frontend display
      const formattedErrors = errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg
      }));
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: formattedErrors 
      });
    }
    next();
  },
];

export const validateRequestWithdrawal = [
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
    body('upiId').isString().notEmpty().withMessage('UPI ID is required.'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

export const validateResetPassword = [
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .matches(/\d/).withMessage('Password must contain a number.')
        .matches(/[a-z]/).withMessage('Password must contain a lowercase letter.')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

export const validateReview = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
    body('comment').isString().optional(),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

export const validateSubscriptionGroup = [
    body('name').optional().isString().notEmpty().withMessage('Name is required.'),
    body('serviceType').optional().isString().notEmpty().withMessage('Service type is required.'),
    body('totalPrice').optional().custom((value) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num) || num <= 0) {
            throw new Error('Total price must be a positive number.');
        }
        return true;
    }),
    body('slotsTotal').optional().custom((value) => {
        const num = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(num) || num <= 0) {
            throw new Error('Total slots must be a positive integer.');
        }
        return true;
    }),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Format errors for better frontend display
            const formattedErrors = errors.array().map(err => ({
                field: err.type === 'field' ? err.path : 'unknown',
                message: err.msg
            }));
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: formattedErrors 
            });
        }
        next();
    },
];

export const validateUpdateProfile = [
    body('name').isString().notEmpty().withMessage('Name is required.'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];