import express from 'express';
import { getFilteredProducts } from '../controllers/productFilterController.js';

const router = express.Router();

// GET /api/products/filter
router.get('/filter', getFilteredProducts);

export default router;
