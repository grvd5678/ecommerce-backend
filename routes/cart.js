import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';
import csrfProtection from '../middleware/csrfProtection.js';

const router = express.Router();

router.use(protect);

router.get('/', getCart);
router.post('/', csrfProtection, addToCart);
router.put('/', csrfProtection, updateCartItem);
router.delete('/:productId', csrfProtection, removeFromCart);
router.delete('/', csrfProtection, clearCart);

export default router;
