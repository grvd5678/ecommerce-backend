import Review from '../models/Review.js';
import { Product } from '../models/AdvancedProduct.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, { rating: 0 });
    return;
  }
  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(productId, { rating: Math.round(avgRating * 10) / 10 });
};

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

export const addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, images } = req.body;
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  if (!product) return next(new AppError('Product not found', 404));

  const existingReview = await Review.findOne({ user: req.user.id, product: productId });
  if (existingReview) return next(new AppError('You have already reviewed this product', 400));

  const review = await Review.create({ user: req.user.id, product: productId, rating, comment, images });
  await updateProductRating(productId);
  await review.populate('user', 'name');
  res.status(201).json(review);
});

export const toggleHelpful = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  const userId = req.user.id;
  const likedIndex = review.helpfulBy.indexOf(userId);

  if (likedIndex > -1) {
    review.helpfulBy.splice(likedIndex, 1);
    review.helpfulCount -= 1;
  } else {
    review.helpfulBy.push(userId);
    review.helpfulCount += 1;
  }

  await review.save();
  res.json({ helpfulCount: review.helpfulCount, isHelpful: likedIndex === -1 });
});

export const updateReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, images } = req.body;

  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { rating, comment, images },
    { new: true, runValidators: true }
  ).populate('user', 'name');

  if (!review) return next(new AppError('Review not found or not authorized', 404));

  await updateProductRating(review.product);
  res.json(review);
});

export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!review) return next(new AppError('Review not found or not authorized', 404));

  await updateProductRating(review.product);
  res.json({ message: 'Review deleted' });
});
