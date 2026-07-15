import express from 'express';
import { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, cancelOrder } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, getMyOrders);
router.get('/admin/all', protect, admin, getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
