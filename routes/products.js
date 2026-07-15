import express from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCategories, getSimilarProducts, getCategoryCounts } from '../controllers/productController.js';
import { protect, admin } from '../middleware/auth.js';
import csrfProtection from '../middleware/csrfProtection.js';
import { validate } from '../middleware/validate.js';
import { productValidationSchema } from '../validation/productValidation.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/categories/counts', getCategoryCounts);
router.get('/:id', getProduct);
router.get('/:id/similar', getSimilarProducts);
router.post('/', (req, res, next) => {
  console.log('Post products route called');
  next();
}, protect, admin, csrfProtection, validate(productValidationSchema), createProduct);
router.put('/:id', protect, admin, csrfProtection, validate(productValidationSchema), updateProduct);
router.delete('/:id', protect, admin, csrfProtection, deleteProduct);

export default router;
