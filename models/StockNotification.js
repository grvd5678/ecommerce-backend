import mongoose from 'mongoose';

const stockNotificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
}, { timestamps: true });

export default mongoose.model('StockNotification', stockNotificationSchema);
