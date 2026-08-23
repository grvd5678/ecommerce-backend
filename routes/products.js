import express from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCategories, getSimilarProducts, getCategoryCounts } from '../controllers/productController.js';
import { protect, admin } from '../middleware/auth.js';
import csrfProtection from '../middleware/csrfProtection.js';
import { validate } from '../middleware/validate.js';
import { productValidationSchema } from '../validation/productValidation.js';

const router = express.Router();

import { GoogleGenerativeAI } from '@google/generative-ai';

// Define specific routes BEFORE parameterized routes to avoid conflicts
router.get('/categories/counts', getCategoryCounts);
router.get('/categories', getCategories);
router.post('/generate-description', protect, admin, async (req, res) => {
  const { name, category, keywords } = req.body;
  if (!name) return res.status(400).json({ message: 'Product name is required' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API Key is not configured' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `You are an expert e-commerce copywriter. Write a compelling, professional, SEO-friendly e-commerce product description for:
Product Name: "${name}"
Category: "${category || 'General'}"
${keywords ? `Key details: "${keywords}"` : ''}

Requirements:
- Keep it 2 to 3 engaging sentences.
- Highlight key benefits and build excitement for the buyer.
- Do not use markdown headers, bullet lists, asterisks, or quotes around the whole text. Return clean plain text only.`;

    const result = await model.generateContent(prompt);
    const description = result.response.text().trim().replace(/^["']|["']$/g, '');
    res.json({ description });
  } catch (error) {
    console.error('Gemini description generation error:', error);
    res.json({
      description: `Experience exceptional quality and modern design with the ${name}. Crafted for everyday performance and lasting durability.`
    });
  }
});
router.get('/:id/similar', getSimilarProducts);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', (req, res, next) => {
  console.log('Post products route called');
  next();
}, protect, admin, csrfProtection, validate(productValidationSchema), createProduct);
router.put('/:id', protect, admin, csrfProtection, validate(productValidationSchema), updateProduct);
router.delete('/:id', protect, admin, csrfProtection, deleteProduct);

export default router;
