const express = require('express');
const router = express.Router();
const {
    getDashboardAnalytics,
    getRealtimeStats
} = require('../controllers/analytics.controller');
const { auth } = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');
const cache = require('../middlewares/cache.middleware');

// All routes require admin authentication
// Cache dashboard for 5 minutes (300s), realtime for 30 seconds
router.get('/dashboard', auth, admin, cache(300), getDashboardAnalytics);
router.get('/realtime', auth, admin, cache(30), getRealtimeStats);

module.exports = router;
