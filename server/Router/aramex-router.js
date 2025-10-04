const express = require('express');
const router = express.Router();
const aramexController = require('../Controller/aramex-controller');
const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Track shipment by waybill number
router.get('/track/:waybillNumber', 
    [
        param('waybillNumber')
            .notEmpty()
            .withMessage('Waybill number is required')
            .isLength({ min: 8, max: 20 })
            .withMessage('Waybill number must be between 8 and 20 characters')
            .matches(/^[A-Z0-9]+$/)
            .withMessage('Waybill number must contain only uppercase letters and numbers')
    ],
    validateRequest,
    aramexController.trackShipment
);

// Track shipment by order ID
router.get('/track-order/:orderId',
    [
        param('orderId')
            .notEmpty()
            .withMessage('Order ID is required')
            .isMongoId()
            .withMessage('Invalid order ID format')
    ],
    validateRequest,
    aramexController.trackShipmentByOrderId
);

// Create shipment for an order
router.post('/create-shipment/:orderId',
    [
        param('orderId')
            .notEmpty()
            .withMessage('Order ID is required')
            .isMongoId()
            .withMessage('Invalid order ID format'),
        body('shipperData')
            .optional()
            .isObject()
            .withMessage('Shipper data must be an object'),
        body('consigneeData')
            .optional()
            .isObject()
            .withMessage('Consignee data must be an object'),
        body('shipmentDetails')
            .optional()
            .isObject()
            .withMessage('Shipment details must be an object')
    ],
    validateRequest,
    aramexController.createShipment
);

// Get shipment history
router.get('/history/:waybillNumber',
    [
        param('waybillNumber')
            .notEmpty()
            .withMessage('Waybill number is required')
            .isLength({ min: 8, max: 20 })
            .withMessage('Waybill number must be between 8 and 20 characters')
            .matches(/^[A-Z0-9]+$/)
            .withMessage('Waybill number must contain only uppercase letters and numbers')
    ],
    validateRequest,
    aramexController.getShipmentHistory
);

// Get all orders with tracking information
router.get('/orders',
    [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),
        query('status')
            .optional()
            .isIn(['pending', 'shipped', 'in_transit', 'delivered', 'exception'])
            .withMessage('Invalid status value')
    ],
    validateRequest,
    aramexController.getOrdersWithTracking
);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Aramex service is healthy',
        timestamp: new Date().toISOString(),
        service: 'Aramex Integration'
    });
});

// Create pickup
router.post('/pickup',
    [
        body('address')
            .isObject()
            .withMessage('Address is required'),
        body('contact')
            .isObject()
            .withMessage('Contact information is required'),
        body('pickupDate')
            .optional()
            .isISO8601()
            .withMessage('Pickup date must be a valid ISO 8601 date')
    ],
    validateRequest,
    aramexController.createPickup
);

// Cancel pickup
router.delete('/pickup/:pickupGUID',
    [
        param('pickupGUID')
            .notEmpty()
            .withMessage('Pickup GUID is required')
    ],
    validateRequest,
    aramexController.cancelPickup
);

// Print label
router.post('/print-label/:waybillNumber',
    [
        param('waybillNumber')
            .notEmpty()
            .withMessage('Waybill number is required'),
        body('reportID')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Report ID must be a positive integer'),
        body('reportType')
            .optional()
            .isIn(['URL', 'PDF', 'PNG'])
            .withMessage('Report type must be URL, PDF, or PNG')
    ],
    validateRequest,
    aramexController.printLabel
);

// Get service information
router.get('/info', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Aramex service information',
        data: {
            service: 'Aramex Shipping Integration',
            version: '1.0.0',
            environment: 'sandbox',
            baseURL: 'http://ws.sbx.aramex.net/shippingapi/shipping/service_1_0.svc',
            supportedOperations: [
                'TrackShipment',
                'CreateShipment',
                'GetShipmentHistory',
                'CreatePickup',
                'CancelPickup',
                'PrintLabel'
            ],
            credentials: {
                accountCountryCode: 'SA',
                accountEntity: 'RUH',
                version: '1.0'
            }
        }
    });
});

module.exports = router;
