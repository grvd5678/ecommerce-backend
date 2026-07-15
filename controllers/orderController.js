import Order from '../models/Order.js';
import { Product } from '../models/AdvancedProduct.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendOrderConfirmation } from '../utils/email.js';

export const createOrder = asyncHandler(async (req, res, next) => {
  const { items } = req.body;

  // Check stock and deduct inventory
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) return next(new AppError(`Product not found: ${item.product}`, 404));
    if (product.stock < item.quantity) {
      return next(new AppError(`Insufficient stock for "${product.name}". Only ${product.stock} left.`, 400));
    }
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  const order = await Order.create({ user: req.user._id, ...req.body });

  try {
    await sendOrderConfirmation(req.user.email, req.user.name, order);
  } catch (emailError) {
    console.error('Order confirmation email failed:', emailError);
  }

  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('items.product');
  res.json(orders);
});

export const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('items.product');
  if (!order) return next(new AppError('Order not found', 404));
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }
  res.json(order);
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('items.product')
    .sort({ createdAt: -1 });
  res.json(orders);
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));
  if (order.user.toString() !== req.user._id.toString()) return next(new AppError('Not authorized', 403));
  if (!['pending', 'processing'].includes(order.status)) {
    return next(new AppError('Order cannot be cancelled at this stage', 400));
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  order.status = 'cancelled';
  await order.save();
  res.json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('items.product');
  if (!order) return next(new AppError('Order not found', 404));
  res.json(order);
});
