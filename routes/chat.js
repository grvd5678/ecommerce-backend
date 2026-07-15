import express from 'express';
import { chat } from '../controllers/chatController.js';
import csrfProtection from '../middleware/csrfProtection.js';

const router = express.Router();

router.post('/', csrfProtection, chat);

export default router;
