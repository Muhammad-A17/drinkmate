const express = require('express');
const router = express.Router();
const urwaysService = require('../Services/urways-service');
const Order = require('../Models/order-model');
const { authenticateToken } = require('../Middleware/auth-middleware');

// Process Urways payment
router.post('/urways', authenticateToken, async (req, res) => {
    try {
        console.log('=== URWAYS PAYMENT REQUEST RECEIVED ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User:', req.user);
        
        const {
            amount,
            currency = 'SAR',
            orderId,
            customerEmail,
            customerName,
            description,
            returnUrl,
            cancelUrl
        } = req.body;

        // Validate required fields
        if (!amount || !orderId || !customerEmail) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: amount, orderId, customerEmail'
            });
        }

        // Check if order exists and belongs to user
        const order = await Order.findOne({
            orderNumber: orderId,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Process payment with Urways
        const paymentResult = await urwaysService.processPayment({
            amount,
            currency,
            orderId,
            customerEmail,
            customerName,
            description,
            returnUrl,
            cancelUrl
        });

        // Always create payment record for tracking
        const Payment = require('../Models/payment-model');
        const payment = new Payment({
            paymentId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            order: order._id,
            orderNumber: orderId,
            customer: req.user.id,
            customerEmail: customerEmail,
            customerName: customerName,
            transactionId: paymentResult.transactionId || `TXN_${Date.now()}`,
            gateway: {
                name: 'urways',
                transactionId: paymentResult.transactionId || `TXN_${Date.now()}`,
                referenceId: paymentResult.referenceId
            },
            method: 'urways',
            amount: amount,
            currency: currency,
            status: paymentResult.success ? 'pending' : 'failed',
            gatewayResponse: paymentResult
        });
        await payment.save();

        if (paymentResult.success) {
            // Update order with payment details
            order.paymentDetails = {
                transactionId: paymentResult.transactionId,
                paymentStatus: 'pending',
                paymentDate: new Date(),
                referenceId: paymentResult.referenceId
            };
            await order.save();

            res.json({
                success: true,
                transactionId: paymentResult.transactionId,
                paymentUrl: paymentResult.paymentUrl,
                referenceId: paymentResult.referenceId
            });
        } else {
            // Update order with failed payment details
            order.paymentDetails = {
                transactionId: paymentResult.transactionId || `TXN_${Date.now()}`,
                paymentStatus: 'failed',
                paymentDate: new Date(),
                error: paymentResult.error,
                errorCode: paymentResult.code
            };
            await order.save();

            res.status(400).json({
                success: false,
                message: paymentResult.error,
                code: paymentResult.code,
                paymentId: payment._id
            });
        }

    } catch (error) {
        console.error('Urways payment route error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment processing failed',
            error: error.message
        });
    }
});

// Verify Urways payment
router.post('/urways/verify', authenticateToken, async (req, res) => {
    try {
        const { transactionId } = req.body;

        if (!transactionId) {
            return res.status(400).json({
                success: false,
                message: 'Transaction ID is required'
            });
        }

        // Verify payment with Urways
        const verificationResult = await urwaysService.verifyPayment(transactionId);

        if (verificationResult.success) {
            // Find and update order
            const order = await Order.findOne({
                'paymentDetails.transactionId': transactionId,
                user: req.user._id
            });

            if (order) {
                order.paymentDetails.paymentStatus = verificationResult.isPaid ? 'paid' : 'failed';
                order.paymentDetails.paymentDate = new Date();
                order.status = verificationResult.isPaid ? 'processing' : 'pending';
                await order.save();
            }

            res.json({
                success: true,
                status: verificationResult.status,
                isPaid: verificationResult.isPaid,
                amount: verificationResult.amount,
                currency: verificationResult.currency
            });
        } else {
            res.status(400).json({
                success: false,
                message: verificationResult.error
            });
        }

    } catch (error) {
        console.error('Urways verification route error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
});

// Handle Urways callback
router.post('/urways/callback', async (req, res) => {
    try {
        const callbackResult = await urwaysService.handleCallback(req.body);

        if (callbackResult.success) {
            // Find and update order
            const order = await Order.findOne({
                'paymentDetails.transactionId': callbackResult.transactionId
            });

            if (order) {
                order.paymentDetails.paymentStatus = callbackResult.isPaid ? 'paid' : 'failed';
                order.paymentDetails.paymentDate = new Date();
                order.status = callbackResult.isPaid ? 'processing' : 'pending';
                await order.save();
            }

            res.json({
                success: true,
                message: 'Callback processed successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: callbackResult.error
            });
        }

    } catch (error) {
        console.error('Urways callback route error:', error);
        res.status(500).json({
            success: false,
            message: 'Callback processing failed',
            error: error.message
        });
    }
});

// Refund Urways payment
router.post('/urways/refund', authenticateToken, async (req, res) => {
    try {
        const { transactionId, amount, reason } = req.body;

        if (!transactionId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Transaction ID and amount are required'
            });
        }

        // Check if order exists and belongs to user
        const order = await Order.findOne({
            'paymentDetails.transactionId': transactionId,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Process refund with Urways
        const refundResult = await urwaysService.refundPayment(
            transactionId,
            amount,
            reason
        );

        if (refundResult.success) {
            // Update order status
            order.paymentDetails.paymentStatus = 'refunded';
            order.status = 'refunded';
            await order.save();

            res.json({
                success: true,
                refundId: refundResult.refundId,
                amount: refundResult.amount,
                status: refundResult.status
            });
        } else {
            res.status(400).json({
                success: false,
                message: refundResult.error
            });
        }

    } catch (error) {
        console.error('Urways refund route error:', error);
        res.status(500).json({
            success: false,
            message: 'Refund processing failed',
            error: error.message
        });
    }
});

// Get available payment methods
router.get('/methods', (req, res) => {
    try {
        const methods = urwaysService.getAvailablePaymentMethods();
        res.json({
            success: true,
            methods
        });
    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment methods',
            error: error.message
        });
    }
});

module.exports = router;
