const express = require('express');
const {
    initPayment,
    executePayment,
    queryPayment,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    refundPayment,
} = require('../controllers/payment.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Customer routes
router.post('/init', auth, initPayment);
router.post('/execute', executePayment);
router.get('/query/:paymentID', auth, queryPayment);

// Callback routes (from bKash)
router.get('/success', paymentSuccess);
router.get('/fail/:paymentID', paymentFail);
router.get('/cancel/:paymentID', paymentCancel);

// Admin routes
router.post('/refund', auth, authorize(['admin', 'super_admin']), refundPayment);

module.exports = router;
