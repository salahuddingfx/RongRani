const axios = require('axios');
const Order = require('../models/Order');

// bKash API Configuration
const BKASH_BASE_URL = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
const BKASH_APP_KEY = process.env.BKASH_APP_KEY;
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET;
const BKASH_USERNAME = process.env.BKASH_USERNAME;
const BKASH_PASSWORD = process.env.BKASH_PASSWORD;

// Get bKash Token
const getBkashToken = async () => {
    try {
        const response = await axios.post(
            `${BKASH_BASE_URL}/tokenized/checkout/token/grant`,
            {
                app_key: BKASH_APP_KEY,
                app_secret: BKASH_APP_SECRET,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    username: BKASH_USERNAME,
                    password: BKASH_PASSWORD,
                },
            }
        );
        return response.data.id_token;
    } catch (error) {
        console.error('bKash Token Error:', error.response?.data || error.message);
        throw new Error('Failed to get bKash token');
    }
};

// Initialize Payment
exports.initPayment = async (req, res) => {
    try {
        const { orderId, amount, customerInfo } = req.body;

        // Validate order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Get bKash token
        const token = await getBkashToken();

        // Create payment
        const paymentResponse = await axios.post(
            `${BKASH_BASE_URL}/tokenized/checkout/create`,
            {
                mode: '0011',
                payerReference: customerInfo.phone || order.shippingAddress.phone,
                callbackURL: `${process.env.CLIENT_URL}/payment/callback`,
                amount: amount.toString(),
                currency: 'BDT',
                intent: 'sale',
                merchantInvoiceNumber: order.orderNumber,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                    'X-APP-Key': BKASH_APP_KEY,
                },
            }
        );

        if (paymentResponse.data.statusCode === '0000') {
            // Update order with payment info
            order.paymentInfo = {
                paymentID: paymentResponse.data.paymentID,
                bkashURL: paymentResponse.data.bkashURL,
                status: 'Pending',
            };
            await order.save();

            res.json({
                success: true,
                data: {
                    paymentID: paymentResponse.data.paymentID,
                    bkashURL: paymentResponse.data.bkashURL,
                },
            });
        } else {
            throw new Error(paymentResponse.data.statusMessage || 'Payment creation failed');
        }
    } catch (error) {
        console.error('Payment Init Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Payment initialization failed',
        });
    }
};

// Execute Payment
exports.executePayment = async (req, res) => {
    try {
        const { paymentID } = req.body;

        // Get bKash token
        const token = await getBkashToken();

        // Execute payment
        const executeResponse = await axios.post(
            `${BKASH_BASE_URL}/tokenized/checkout/execute`,
            { paymentID },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                    'X-APP-Key': BKASH_APP_KEY,
                },
            }
        );

        if (executeResponse.data.statusCode === '0000') {
            // Find and update order
            const order = await Order.findOne({ 'paymentInfo.paymentID': paymentID });

            if (order) {
                order.paymentInfo.status = 'Completed';
                order.paymentInfo.trxID = executeResponse.data.trxID;
                order.paymentInfo.transactionStatus = executeResponse.data.transactionStatus;
                order.paymentInfo.paidAt = new Date();
                order.isPaid = true;
                order.orderStatus = 'Processing';
                await order.save();
            }

            res.json({
                success: true,
                message: 'Payment successful',
                data: executeResponse.data,
            });
        } else {
            throw new Error(executeResponse.data.statusMessage || 'Payment execution failed');
        }
    } catch (error) {
        console.error('Payment Execute Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Payment execution failed',
        });
    }
};

// Query Payment
exports.queryPayment = async (req, res) => {
    try {
        const { paymentID } = req.params;

        // Get bKash token
        const token = await getBkashToken();

        // Query payment
        const queryResponse = await axios.post(
            `${BKASH_BASE_URL}/tokenized/checkout/payment/status`,
            { paymentID },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                    'X-APP-Key': BKASH_APP_KEY,
                },
            }
        );

        res.json({
            success: true,
            data: queryResponse.data,
        });
    } catch (error) {
        console.error('Payment Query Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Payment query failed',
        });
    }
};

// Payment Success Callback
exports.paymentSuccess = async (req, res) => {
    try {
        const { paymentID, status } = req.query;

        if (status === 'success') {
            // Execute the payment
            await exports.executePayment({ body: { paymentID } }, res);
        } else {
            res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
        }
    } catch (error) {
        console.error('Payment Success Callback Error:', error);
        res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
    }
};

// Payment Fail
exports.paymentFail = async (req, res) => {
    try {
        const { paymentID } = req.params;

        // Update order status
        const order = await Order.findOne({ 'paymentInfo.paymentID': paymentID });
        if (order) {
            order.paymentInfo.status = 'Failed';
            order.orderStatus = 'Payment Failed';
            await order.save();
        }

        res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
    } catch (error) {
        console.error('Payment Fail Error:', error);
        res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
    }
};

// Payment Cancel
exports.paymentCancel = async (req, res) => {
    try {
        const { paymentID } = req.params;

        // Update order status
        const order = await Order.findOne({ 'paymentInfo.paymentID': paymentID });
        if (order) {
            order.paymentInfo.status = 'Cancelled';
            order.orderStatus = 'Cancelled';
            await order.save();
        }

        res.redirect(`${process.env.CLIENT_URL}/payment-cancelled`);
    } catch (error) {
        console.error('Payment Cancel Error:', error);
        res.redirect(`${process.env.CLIENT_URL}/payment-cancelled`);
    }
};

// Refund Payment
exports.refundPayment = async (req, res) => {
    try {
        const { paymentID, amount, trxID, reason } = req.body;

        // Get bKash token
        const token = await getBkashToken();

        // Refund payment
        const refundResponse = await axios.post(
            `${BKASH_BASE_URL}/tokenized/checkout/payment/refund`,
            {
                paymentID,
                amount: amount.toString(),
                trxID,
                sku: 'product',
                reason: reason || 'Customer requested refund',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                    'X-APP-Key': BKASH_APP_KEY,
                },
            }
        );

        if (refundResponse.data.statusCode === '0000') {
            // Update order
            const order = await Order.findOne({ 'paymentInfo.paymentID': paymentID });
            if (order) {
                order.paymentInfo.refundID = refundResponse.data.refundTrxID;
                order.paymentInfo.status = 'Refunded';
                order.orderStatus = 'Refunded';
                await order.save();
            }

            res.json({
                success: true,
                message: 'Refund successful',
                data: refundResponse.data,
            });
        } else {
            throw new Error(refundResponse.data.statusMessage || 'Refund failed');
        }
    } catch (error) {
        console.error('Refund Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Refund failed',
        });
    }
};
