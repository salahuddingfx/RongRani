const express = require('express');
const { createOrder, getOrders, getOrderById, getOrderForTracking, updateOrderStatus, cancelOrder, generateOrderInvoice } = require('../controllers/order.controller');
const { auth, authorize, optionalAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Create order (guest or authenticated)
router.post('/', optionalAuth, createOrder);

// Authenticated user routes
router.get('/track/:id', optionalAuth, getOrderForTracking);
router.get('/', auth, getOrders);
router.get('/:id', auth, getOrderById);
router.put('/:id/cancel', auth, cancelOrder);
router.get('/:id/invoice', auth, generateOrderInvoice);

// Admin routes
router.put('/:id/status', auth, authorize(['admin', 'super_admin']), updateOrderStatus);

module.exports = router;