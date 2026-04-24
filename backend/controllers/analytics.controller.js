const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get dashboard analytics with detailed metrics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
exports.getDashboardAnalytics = asyncHandler(async (req, res) => {
    const { period = '7days' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    let prevStartDate;

    switch (period) {
        case '24hours':
            startDate = new Date(new Date().setHours(now.getHours() - 24));
            prevStartDate = new Date(new Date().setHours(now.getHours() - 48));
            break;
        case '7days':
            startDate = new Date(new Date().setDate(now.getDate() - 7));
            prevStartDate = new Date(new Date().setDate(now.getDate() - 14));
            break;
        case '30days':
            startDate = new Date(new Date().setDate(now.getDate() - 30));
            prevStartDate = new Date(new Date().setDate(now.getDate() - 60));
            break;
        case '90days':
            startDate = new Date(new Date().setDate(now.getDate() - 90));
            prevStartDate = new Date(new Date().setDate(now.getDate() - 180));
            break;
        default:
            startDate = new Date(new Date().setDate(now.getDate() - 7));
            prevStartDate = new Date(new Date().setDate(now.getDate() - 14));
    }

    // 1. Basic Counts
    const totalOrders = await Order.countDocuments({ createdAt: { $gte: startDate } });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered', createdAt: { $gte: startDate } });
    const returnedOrders = await Order.countDocuments({ orderStatus: 'returned', createdAt: { $gte: startDate } });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled', createdAt: { $gte: startDate } });

    // 2. Revenue & Potential Loss
    const financialData = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: null,
                totalRevenue: { 
                    $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0] } 
                },
                potentialLoss: { 
                    $sum: { $cond: [{ $in: ["$orderStatus", ["cancelled", "returned"]] }, "$total", 0] } 
                },
                avgOrderValue: { $avg: "$total" }
            }
        }
    ]);

    // 3. Previous Period Data (for comparison)
    const prevFinancialData = await Order.aggregate([
        { $match: { createdAt: { $gte: prevStartDate, $lt: startDate } } },
        {
            $group: {
                _id: null,
                totalRevenue: { 
                    $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0] } 
                }
            }
        }
    ]);

    // 4. Sales Trend (Day-to-day)
    const salesTrend = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$total' },
                orders: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // 5. Category Distribution
    const categoryRevenue = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        { $unwind: '$productInfo' },
        {
            $group: {
                _id: '$productInfo.category',
                revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                count: { $sum: 1 }
            }
        }
    ]);

    // 6. Summary Stats
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 5 }, isActive: true });

    const currentRevenue = financialData[0]?.totalRevenue || 0;
    const prevRevenue = prevFinancialData[0]?.totalRevenue || 0;
    const revenueGrowth = prevRevenue === 0 ? 100 : ((currentRevenue - prevRevenue) / prevRevenue) * 100;

    res.status(200).json(new ApiResponse(200, {
        summary: {
            revenue: currentRevenue,
            revenueGrowth: revenueGrowth.toFixed(2),
            potentialLoss: financialData[0]?.potentialLoss || 0,
            orders: totalOrders,
            delivered: deliveredOrders,
            returned: returnedOrders,
            cancelled: cancelledOrders,
            avgOrderValue: (financialData[0]?.avgOrderValue || 0).toFixed(2),
            totalUsers,
            totalProducts,
            lowStockProducts
        },
        salesTrend,
        categoryRevenue,
        period
    }));
});

// @desc    Get real-time stats
// @route   GET /api/analytics/realtime
// @access  Private/Admin
exports.getRealtimeStats = asyncHandler(async (req, res) => {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
        todayOrders,
        todayRevenue,
        todayUsers,
        activeOrders
    ] = await Promise.all([
        Order.countDocuments({ createdAt: { $gte: last24Hours } }),
        Order.aggregate([
            { $match: { createdAt: { $gte: last24Hours }, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]),
        User.countDocuments({ createdAt: { $gte: last24Hours } }),
        Order.countDocuments({
            orderStatus: { $in: ['pending', 'processing', 'shipped'] }
        })
    ]);

    res.status(200).json(new ApiResponse(200, {
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        todayUsers,
        activeOrders,
        timestamp: new Date()
    }));
});
