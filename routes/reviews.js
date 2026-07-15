import express from 'express';
import { getProductReviews, addReview, updateReview, deleteReview, toggleHelpful } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import csrfProtection from '../middleware/csrfProtection.js';

const router = express.Router();

router.get('/:productId', getProductReviews);
router.post('/:productId', protect, csrfProtection, addReview);
router.put('/:id', protect, csrfProtection, updateReview);
router.put('/:id/helpful', protect, csrfProtection, toggleHelpful);
router.delete('/:id', protect, csrfProtection, deleteReview);

export default router;
