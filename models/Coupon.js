import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountPercentage: { type: Number, required: true, min: 0, max: 100 },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date }
});

export default mongoose.model('Coupon', couponSchema);
