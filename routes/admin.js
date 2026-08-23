import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { Product } from '../models/AdvancedProduct.js';
import Category from '../models/Category.js';
import { protect, admin } from '../middleware/auth.js';
import csrfProtection from '../middleware/csrfProtection.js';

const router = express.Router();

// GET /api/admin/analytics - Aggregated business intelligence & charts data
router.get('/analytics', protect, admin, async (req, res) => {
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

    // 5. Category Distribution
    const categoryStats = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$categoryInfo.name',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ['$_id', 'Uncategorized'] },
          count: 1
        }
      },
      { $sort: { count: -1 } }
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
      categoryStats
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/role', protect, admin, csrfProtection, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/users/:id', protect, admin, csrfProtection, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
