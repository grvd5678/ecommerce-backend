import 'dotenv/config';
import connectDB from './config/db.js';
import Category from './models/Category.js';

const categories = [
  { name: 'Electronics' },
  { name: 'Fashion' },
  { name: 'Home' },
  { name: 'Sports' },
  { name: 'Accessories' }
];

const seedCategories = async () => {
  try {
    await connectDB();
    await Category.deleteMany();
    await Category.insertMany(categories);
    console.log('✅ Categories seeded successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
