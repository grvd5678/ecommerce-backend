import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { Product } from '../models/AdvancedProduct.js';
import Category from '../models/Category.js';
import { protect, admin } from '../middleware/auth.js';
import csrfProtection from '../middleware/csrfProtection.js';
import { cacheResponse } from '../middleware/cache.js';

const router = express.Router();

// GET /api/admin/analytics - Aggregated business intelligence & charts data (Cached for 2 minutes)
router.get('/analytics', protect, admin, cacheResponse(120, 'admin:analytics'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. KPI Counts
    const [totalUsers, totalProducts, totalOrdersResult] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $cond: [{ $ne: ['$status', 'cancelled'] }, '$total', 0]
              }
            },
            totalOrders: { $sum: 1 }
          }
        }
      ])
    ]);

    const totalRevenue = totalOrdersResult[0]?.totalRevenue || 0;
    const totalOrders = totalOrdersResult[0]?.totalOrders || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 2. Sales Over Time (Daily Timeline)
    const salesOverTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: 1,
          orders: 1
        }
      }
    ]);

    // 3. Order Status Breakdown
    const orderStatusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
          revenue: 1
        }
      }
    ]);

    // 4. Top Selling Products
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          productId: { $first: '$items.product' },
          name: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          name: 1,
          unitsSold: 1,
          revenue: 1
        }
      }
    ]);

    // 5. Category Breakdown
    const categoryBreakdown = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
          totalStock: 1
        }
      }
    ]);

    res.json({
      kpis: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalProducts,
        totalUsers,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100
      },
      salesOverTime,
      orderStatusBreakdown,
      topProducts,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});

// User Management Routes
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/users/:id', protect, admin, csrfProtection, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin user' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/role', protect, admin, csrfProtection, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = req.body.role || user.role;
    await user.save();
    res.json({ message: 'User role updated', user: { _id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Order Management Routes
router.get('/orders', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/orders/:id/status', protect, admin, csrfProtection, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = req.body.status || order.status;
    if (req.body.status === 'delivered') order.deliveredAt = Date.now();
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
