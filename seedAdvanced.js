import mongoose from 'mongoose';
import { Product } from './models/AdvancedProduct.js';
import Category from './models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      tls: true,
      tlsAllowInvalidCertificates: false
    });
    console.log("Connected to MongoDB...");

    // Fetch valid categories
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.error("No categories found. Please seed categories first.");
      process.exit(1);
    }

    const electronics = categories.find(c => c.name === 'Electronics')?._id || categories[0]._id;
    const fashion = categories.find(c => c.name === 'Fashion')?._id || categories[0]._id;
    const accessories = categories.find(c => c.name === 'Accessories')?._id || categories[0]._id;
    const home = categories.find(c => c.name === 'Home')?._id || categories[0]._id;

    const products = [
      {
        name: "Classic T-Shirt",
        description: "100% Cotton, comfortable fit.",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
        basePrice: 599,
        category: fashion,
        specifications: [{ key: "Material", value: "Cotton" }],
        variations: [
          { color: "Red", size: "M", sku: "TS-RED-M", stock: 50 },
          { color: "Blue", size: "L", sku: "TS-BLU-L", stock: 30 }
        ]
      },
      {
        name: "Wireless Headphones",
        description: "Noise cancelling, 20h battery life.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        basePrice: 2999,
        category: electronics,
        specifications: [{ key: "Type", value: "Over-ear" }],
        variations: [{ color: "Black", sku: "WH-BLK", stock: 10 }]
      },
      {
        name: "Smart Watch",
        description: "Fitness tracking smartwatch.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        basePrice: 1999,
        category: electronics,
        specifications: [{ key: "Water Resistant", value: "Yes" }],
        variations: [{ color: "Silver", sku: "SW-SLV", stock: 15 }]
      },
      {
        name: "Running Shoes",
        description: "Comfortable running shoes.",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        basePrice: 899,
        category: fashion,
        specifications: [{ key: "Sole", value: "Rubber" }],
        variations: [{ color: "Black", size: "10", sku: "RS-BLK-10", stock: 20 }]
      },
      {
        name: "Desk Lamp",
        description: "LED desk lamp with adjustable brightness.",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
        basePrice: 350,
        category: home,
        specifications: [{ key: "Power", value: "10W" }],
        variations: [{ color: "White", sku: "DL-WHT", stock: 25 }]
      },
      {
        name: "Leather Wallet",
        description: "Genuine leather wallet.",
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93",
        basePrice: 450,
        category: accessories,
        specifications: [{ key: "Material", value: "Leather" }],
        variations: [{ color: "Brown", sku: "LW-BRN", stock: 40 }]
      }
    ];

    await Product.deleteMany({});
    await Product.insertMany(products);
    
    console.log("Database seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedProducts();
