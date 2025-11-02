import { Router } from 'express';
import { createReview, getReviewsByGroup, updateReview, deleteReview } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createReview);
router.get('/:groupId', getReviewsByGroup);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
