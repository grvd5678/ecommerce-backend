import mongoose from 'mongoose';

// 1. Review Schema (Sub-document)
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  helpfulVotes: { type: Number, default: 0 },
  votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// 2. Variation Schema (for inventory management)
const variationSchema = new mongoose.Schema({
  color: { type: String },
  size: { type: String },
  sku: { type: String, required: true },
  priceAdjustment: { type: Number, default: 0 }, // Adjust base price if needed
  stock: { type: Number, required: true, min: 0 }
});

// 3. Main Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  basePrice: { type: Number, required: true },
  
  // Nested Categories (Reference to Category collection)
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  
  // Dynamic Specifications
  specifications: [{
    key: { type: String, required: true },
    value: { type: String, required: true }
  }],
  
  // Inventory Variations (Color/Size/Stock)
  variations: [variationSchema],
  
  // Parent-Child relationship for complex variations
  parentProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  
  // Reviews
  reviews: [reviewSchema],
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

// Optimized Indexes for Search
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, 'specifications.key': 1, 'specifications.value': 1 });

export const Product = mongoose.model('Product', productSchema);
