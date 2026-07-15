import 'dotenv/config';
import connectDB from './config/db.js';
import User from './models/User.js';

const createAdminUser = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      process.exit();
    }

    await User.create({
      name: process.env.ADMIN_NAME || 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true
    });

    console.log('✅ Admin user created successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
