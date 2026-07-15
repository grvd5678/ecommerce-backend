import { Product } from '../models/AdvancedProduct.js';
import Category from '../models/Category.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  
  // Build hierarchy
  const hierarchy = categories
    .filter(c => !c.parent)
    .map(parent => ({
      ...parent.toObject(),
      subcategories: categories.filter(child => child.parent && child.parent.equals(parent._id))
    }));
    
  res.json(hierarchy);
});

export const getProducts = asyncHandler(async (req, res, next) => {
  const { search, category, subcategory, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

  let query = {};

  // 1. Text Search
  if (search) {
    query.$text = { $search: search };
  }

  // 2. Hierarchical Category Filtering
  if (category) {
    const decodedCategory = decodeURIComponent(category);
    // Check if it's a subcategory
    const subCat = await Category.findOne({ name: { $regex: new RegExp(`^${decodedCategory}$`, 'i') } });
    if (subCat && subCat.parent) {
      query.category = subCat._id;
    } else {
      // If it's a parent category or not found as sub, check as parent
      const parentCat = await Category.findOne({ name: { $regex: new RegExp(`^${decodedCategory}$`, 'i') } });
      if (parentCat) {
        const subCategories = await Category.find({ parent: parentCat._id });
        const categoryIds = [parentCat._id, ...subCategories.map(c => c._id)];
        query.$or = categoryIds.map(id => ({ category: id }));
      } else {
        query.category = null; // No results
      }
    }
  }

  // Also handle subcategory if passed separately from frontend
  if (subcategory) {
    const decodedSubcategory = decodeURIComponent(subcategory);
    const subCat = await Category.findOne({ name: { $regex: new RegExp(`^${decodedSubcategory}$`, 'i') } });
    if (subCat) {
        query.category = subCat._id;
    }
  }

  if (minPrice || maxPrice) {
    query.basePrice = {};
    if (minPrice) query.basePrice.$gte = Number(minPrice);
    if (maxPrice) query.basePrice.$lte = Number(maxPrice);
  }

  let sortOption = {};
  if (sort) {
    const sortMap = { 'price-low': { basePrice: 1 }, 'price-high': { basePrice: -1 }, rating: { averageRating: -1 }, newest: { createdAt: -1 } };
    sortOption = sortMap[sort] || { createdAt: -1 };
  }

  const skip = (page - 1) * limit;
  const products = await Product.find(query).sort(sortOption).skip(skip).limit(Number(limit));
  const total = await Product.countDocuments(query);

  res.json({
    products,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
});

export const getSimilarProducts = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  const similarProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id }
  }).limit(4);

  res.json(similarProducts);
});

export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));
  res.json(product);
});
// ... (rest of methods)

export const createProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return next(new AppError('Product not found', 404));
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));
  res.json({ message: 'Product deleted' });
});

export const getCategoryCounts = asyncHandler(async (req, res) => {
  const counts = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "catInfo" } }
  ]);
  res.json(counts);
});
