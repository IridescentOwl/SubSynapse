import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { log } from '../utils/logging.util';
import prisma from '../utils/prisma.singleton';

const SPAM_KEYWORDS = ['spam', 'test', 'review'];

const containsSpam = (text: string) => {
  if (!text) return false;
  const lowercasedText = text.toLowerCase();
  return SPAM_KEYWORDS.some(keyword => lowercasedText.includes(keyword));
};

export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  const { groupId, rating, comment } = req.body;
  const userId = req.user!.id;

  if (!groupId || !rating) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (containsSpam(comment)) {
    return res.status(400).json({ message: 'Comment contains spam' });
  }

  try {
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        groupId,
      },
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this group' });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        groupId,
        rating,
        comment,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    log('error', 'Error creating review', { error });
    res.status(500).json({ message: 'Error creating review' });
  }
};

export const getReviewsByGroup = async (req: AuthenticatedRequest, res: Response) => {
  const { groupId } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: {
        groupId,
      },
    });

    res.json(reviews);
  } catch (error) {
    log('error', 'Error fetching reviews', { error });
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

export const updateReview = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user!.id;

  if (containsSpam(comment)) {
    return res.status(400).json({ message: 'Comment contains spam' });
  }

  try {
    const review = await prisma.review.findUnique({
      where: {
        id,
      },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this review' });
    }

    const updatedReview = await prisma.review.update({
      where: {
        id,
      },
      data: {
        rating,
        comment,
      },
    });

    res.json(updatedReview);
  } catch (error) {
    log('error', 'Error updating review', { error });
    res.status(500).json({ message: 'Error updating review' });
  }
};

export const deleteReview = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  try {
    const review = await prisma.review.findUnique({
      where: {
        id,
      },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
    }

    await prisma.review.delete({
      where: {
        id,
      },
    });

    res.status(204).send();
  } catch (error) {
    log('error', 'Error deleting review', { error });
    res.status(500).json({ message: 'Error deleting review' });
  }
};
