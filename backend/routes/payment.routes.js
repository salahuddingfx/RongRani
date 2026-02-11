const express = require('express');
const axios = require('axios');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ==================== BKASH PAYMENT ====================
// bKash API configuration
const BKASH_CONFIG = {
    baseURL: process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
    username: process.env.BKASH_USERNAME || '', // Add your bKash username
    password: process.env.BKASH_PASSWORD || '', // Add your bKash password
    appKey: process.env.BKASH_APP_KEY || '', // Add your bKash app key
    appSecret: process.env.BKASH_APP_SECRET || '', // Add your bKash app secret
};

// bKash: Grant Token
router.post('/bkash/grant-token', async (req, res) => {
    try {
        const response = await axios.post(
            `${BKASH_CONFIG.baseURL}/tokenized/checkout/token/grant`,
            {
                app_key: BKASH_CONFIG.appKey,
                app_secret: BKASH_CONFIG.appSecret,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    username: BKASH_CONFIG.username,
                    password: BKASH_CONFIG.password,
                },
            }
        );

        res.json({
            success: true,
            token: response.data.id_token,
        });
    } catch (error) {
        console.error('bKash Grant Token Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get bKash token',
            error: error.response?.data || error.message,
        });
    }
});

// bKash: Create Payment
router.post('/bkash/create', auth, async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        const token = req.headers['authorization']?.split(' ')[1];

        const response = await axios.post(
            `${BKASH_CONFIG.baseURL}/tokenized/checkout/create`,
            {
                mode: '0011', // Tokenized checkout
                payerReference: req.user.id,
                callbackURL: `${process.env.FRONTEND_URL}/payment/callback`,
                amount: amount.toString(),
                currency: 'BDT',
                intent: 'sale',
                merchantInvoiceNumber: orderId,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    authorization: token,
                    'x-app-key': BKASH_CONFIG.appKey,
                },
            }
        );

        res.json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.error('bKash Create Payment Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create bKash payment',
            error: error.response?.data || error.message,
        });
    }
});

// bKash: Execute Payment
router.post('/bkash/execute', auth, async (req, res) => {
    try {
        const { paymentID } = req.body;
        const token = req.headers['authorization']?.split(' ')[1];

        const response = await axios.post(
            `${BKASH_CONFIG.baseURL}/tokenized/checkout/execute`,
            { paymentID },
            {
                headers: {
                    'Content-Type': 'application/json',
                    authorization: token,
                    'x-app-key': BKASH_CONFIG.appKey,
                },
            }
        );

        if (response.data.transactionStatus === 'Completed') {
            // Update order payment status
            await Order.findOneAndUpdate(
                { orderNumber: response.data.merchantInvoiceNumber },
                {
                    paymentStatus: 'paid',
                    'paymentDetails.transactionId': response.data.trxID,
                    'paymentDetails.paymentMethod': 'bKash',
                }
            );
        }

        res.json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.error('bKash Execute Payment Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to execute bKash payment',
            error: error.response?.data || error.message,
        });
    }
});

// ==================== NAGAD PAYMENT ====================
const NAGAD_CONFIG = {
    baseURL: process.env.NAGAD_BASE_URL || 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs',
    merchantId: process.env.NAGAD_MERCHANT_ID || '', // Add your Nagad merchant ID
    merchantNumber: process.env.NAGAD_MERCHANT_NUMBER || '', // Add your Nagad merchant number
    publicKey: process.env.NAGAD_PUBLIC_KEY || '', // Add your Nagad public key
    privateKey: process.env.NAGAD_PRIVATE_KEY || '', // Add your Nagad private key
};

// Nagad: Initialize Payment
router.post('/nagad/init', auth, async (req, res) => {
    try {
        const { amount } = req.body;

        // Generate unique Nagad order ID
        const timestamp = Date.now();
        const nagadOrderId = `NG${timestamp}`;

        const paymentData = {
            merchantId: NAGAD_CONFIG.merchantId,
            orderId: nagadOrderId,
            amount: amount.toString(),
            dateTime: timestamp,
            challenge: 'challenge-string',
        };

        const response = await axios.post(
            `${NAGAD_CONFIG.baseURL}/check-out/initialize/${NAGAD_CONFIG.merchantId}/${nagadOrderId}`,
            paymentData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-KM-Api-Version': 'v-0.2.0',
                },
            }
        );

        res.json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.error('Nagad Init Payment Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize Nagad payment',
            error: error.response?.data || error.message,
        });
    }
});

// Nagad: Complete Payment
router.post('/nagad/complete', auth, async (req, res) => {
    try {
        const { paymentRefId, orderId } = req.body;

        const response = await axios.post(
            `${NAGAD_CONFIG.baseURL}/check-out/complete/${paymentRefId}`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-KM-Api-Version': 'v-0.2.0',
                },
            }
        );

        if (response.data.status === 'Success') {
            await Order.findOneAndUpdate(
                { orderNumber: orderId },
                {
                    paymentStatus: 'paid',
                    'paymentDetails.transactionId': response.data.issuerPaymentRefNo,
                    'paymentDetails.paymentMethod': 'Nagad',
                }
            );
        }

        res.json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.error('Nagad Complete Payment Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to complete Nagad payment',
            error: error.response?.data || error.message,
        });
    }
});

// ==================== SSL COMMERZ PAYMENT ====================
const SSLCOMMERZ_CONFIG = {
    storeId: process.env.SSLCOMMERZ_STORE_ID || '', // Add your SSL Commerz store ID
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || '', // Add your SSL Commerz store password
    isLive: process.env.NODE_ENV === 'production',
    baseURL: process.env.NODE_ENV === 'production'
        ? 'https://securepay.sslcommerz.com'
        : 'https://sandbox.sslcommerz.com',
};

// SSL Commerz: Initialize Payment
router.post('/sslcommerz/init', auth, async (req, res) => {
    try {
        const { amount, orderId, customerName, customerEmail, customerPhone } = req.body;

        const paymentData = {
            store_id: SSLCOMMERZ_CONFIG.storeId,
            store_passwd: SSLCOMMERZ_CONFIG.storePassword,
            total_amount: amount,
            currency: 'BDT',
            tran_id: orderId,
            success_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/success`,
            fail_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/fail`,
            cancel_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/cancel`,
            ipn_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/ipn`,
            shipping_method: 'Courier',
            product_name: 'RongRani Products',
            product_category: 'Gifts',
            product_profile: 'general',
            cus_name: customerName,
            cus_email: customerEmail,
            cus_add1: 'Bangladesh',
            cus_city: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: customerPhone,
            ship_name: customerName,
            ship_add1: 'Bangladesh',
            ship_city: 'Dhaka',
            ship_postcode: '1000',
            ship_country: 'Bangladesh',
        };

        const response = await axios.post(
            `${SSLCOMMERZ_CONFIG.baseURL}/gwprocess/v4/api.php`,
            new URLSearchParams(paymentData).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        res.json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.error('SSL Commerz Init Payment Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize SSL Commerz payment',
            error: error.response?.data || error.message,
        });
    }
});

// SSL Commerz: Success Callback
router.post('/sslcommerz/success', async (req, res) => {
    try {
        const { tran_id, status, val_id } = req.body;

        if (status === 'VALID') {
            await Order.findOneAndUpdate(
                { orderNumber: tran_id },
                {
                    paymentStatus: 'paid',
                    'paymentDetails.transactionId': val_id,
                    'paymentDetails.paymentMethod': 'SSL Commerz',
                }
            );

            res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${tran_id}`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/payment/failed?orderId=${tran_id}`);
        }
    } catch (error) {
        console.error('SSL Commerz Success Callback Error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/payment/error`);
    }
});

// SSL Commerz: Fail Callback
router.post('/sslcommerz/fail', async (req, res) => {
    const { tran_id } = req.body;
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?orderId=${tran_id}`);
});

// SSL Commerz: Cancel Callback
router.post('/sslcommerz/cancel', async (req, res) => {
    const { tran_id } = req.body;
    res.redirect(`${process.env.FRONTEND_URL}/payment/cancelled?orderId=${tran_id}`);
});

// ==================== ROCKET PAYMENT ====================
// Rocket payment integration (similar structure, add when API is available)
router.post('/rocket/init', auth, async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Rocket payment integration coming soon. Please add Rocket API credentials.',
    });
});

module.exports = router;
