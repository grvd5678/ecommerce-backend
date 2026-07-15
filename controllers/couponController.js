import Coupon from '../models/Coupon.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

export const validateCoupon = asyncHandler(async (req, res, next) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code, isActive: true });

  if (!coupon || (coupon.expiresAt && coupon.expiresAt < new Date())) {
    return next(new AppError('Invalid or expired coupon', 400));
  }

  res.json({ discountPercentage: coupon.discountPercentage });
});
