import Cart from '../models/Cart.js';
import { Product } from '../models/AdvancedProduct.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart) return res.json({ items: [], totalAmount: 0 });
  res.json(cart);
});

export const addToCart = asyncHandler(async (req, res, next) => {
  logger.info('addToCart: request body');
  const { productId, quantity = 1 } = req.body;
  logger.info(`addToCart: productId ${productId}`);

  if (!productId) {
    logger.error('addToCart: No productId provided');
    return next(new AppError('No productId provided', 400));
  }

  const product = await Product.findById(productId);
  logger.info(`addToCart: product found ${!!product}`);
  if (!product) return next(new AppError('Product not found', 404));
  
  if (product.stock < quantity) return next(new AppError('Insufficient stock', 400));

  let cart = await Cart.findOne({ user: req.user.id });
  logger.info(`addToCart: cart found ${!!cart}`);

  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [{ product: productId, quantity, price: product.basePrice }] });
  } else {
    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price: product.basePrice });
    }
  }

  await cart.save();
  logger.info('addToCart: cart saved');
  await cart.populate('items.product');
  logger.info('addToCart: cart populated');
  res.json(cart);
});

export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;

  if (quantity < 1) return next(new AppError('Quantity must be at least 1', 400));

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new AppError('Cart not found', 404));

  const item = cart.items.find(item => item.product.toString() === productId);
  if (!item) return next(new AppError('Item not found in cart', 404));

  const product = await Product.findById(productId);
  if (product.stock < quantity) return next(new AppError('Insufficient stock', 400));

  item.quantity = quantity;
  await cart.save();
  await cart.populate('items.product');
  res.json(cart);
});

export const removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new AppError('Cart not found', 404));

  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  await cart.save();
  await cart.populate('items.product');
  res.json(cart);
});

export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new AppError('Cart not found', 404));

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();
  res.json({ message: 'Cart cleared successfully', cart });
});
