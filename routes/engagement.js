import express from 'express';
import { subscribeToStockNotification, getRecommendations } from '../controllers/engagementController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/notify/:productId', subscribeToStockNotification);
router.get('/recommendations/:productId', getRecommendations);

export default router;
