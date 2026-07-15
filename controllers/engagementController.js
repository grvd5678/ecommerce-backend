import StockNotification from '../models/StockNotification.js';
import Order from '../models/Order.js';
import { Product } from '../models/AdvancedProduct.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// Stock Notifications
export const subscribeToStockNotification = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { email } = req.body;
  await StockNotification.create({ email, product: productId });
  res.status(201).json({ message: 'Subscribed to stock notifications' });
});

// Frequently Bought Together
export const getRecommendations = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const orders = await Order.find({ 'items.product': productId });
  
  const recommendations = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (item.product.toString() !== productId) {
        recommendations[item.product] = (recommendations[item.product] || 0) + 1;
      }
    });
  });

  const productIds = Object.keys(recommendations).sort((a, b) => recommendations[b] - recommendations[a]).slice(0, 4);
  const products = await Product.find({ _id: { $in: productIds } });
  res.json(products);
});
