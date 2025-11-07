import { Router } from 'express';
import { createReview, getReviewsByGroup, updateReview, deleteReview } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateReview } from '../middleware/validation.middleware';

const router = Router();

router.post('/', authenticate, validateReview, createReview);
router.get('/:groupId', getReviewsByGroup);
router.put('/:id', authenticate, validateReview, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
