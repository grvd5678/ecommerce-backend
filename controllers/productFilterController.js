import { Product } from '../models/AdvancedProduct.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getFilteredProducts = asyncHandler(async (req, res) => {
  const { 
    brands, 
    minPrice, 
    maxPrice, 
    minRating, 
    sort, 
    page = 1, 
    limit = 10 
  } = req.query;

  const query = {};

  // 1. Multi-select Brands (Assuming brands are in specifications or a field)
  if (brands) {
    const brandArray = brands.split(',');
    query['specifications'] = { 
      $elemMatch: { key: 'Brand', value: { $in: brandArray } } 
    };
  }

  // 2. Price Range
  if (minPrice || maxPrice) {
    query.basePrice = {};
    if (minPrice) query.basePrice.$gte = Number(minPrice);
    if (maxPrice) query.basePrice.$lte = Number(maxPrice);
  }

  // 3. Minimum Rating
  if (minRating) {
    query.averageRating = { $gte: Number(minRating) };
  }

  // 4. Sorting
  let sortOption = { createdAt: -1 }; // Default: Newest
  if (sort === 'price-asc') sortOption = { basePrice: 1 };
  if (sort === 'price-desc') sortOption = { basePrice: -1 };
  if (sort === 'top-rated') sortOption = { averageRating: -1 };

  // 5. Pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Execute Query
  const products = await Product.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit))
    .populate('category');

  const total = await Product.countDocuments(query);

  res.json({
    products,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalProducts: total
    }
  });
});
