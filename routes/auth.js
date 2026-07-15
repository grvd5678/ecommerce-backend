import express from 'express';
import { register, login, getMe, verifyOTP, resendOTP, forgotPassword, resetPassword, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, otpSchema } from '../validation/authValidation.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/verify-otp', validate(otpSchema), verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', protect, changePassword);
router.get('/me', protect, getMe);

export default router;
