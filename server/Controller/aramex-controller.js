const aramexService = require('../Services/aramex-service');
const Order = require('../Models/order-model');
const { validationResult } = require('express-validator');

/**
 * Track shipment by waybill number
 */
exports.trackShipment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { waybillNumber } = req.params;
        
        if (!waybillNumber) {
            return res.status(400).json({
                success: false,
                message: 'Waybill number is required'
            });
        }

        // Track shipment using Aramex service
        const trackingResult = await aramexService.trackShipment(waybillNumber);
        
        if (!trackingResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to track shipment',
                error: trackingResult.error
            });
        }

        // Update order with tracking information if order exists
        await updateOrderWithTracking(waybillNumber, trackingResult);

        res.status(200).json({
            success: true,
            message: 'Shipment tracked successfully',
            data: trackingResult
        });

    } catch (error) {
        console.error('Track shipment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Track shipment by order ID
 */
exports.trackShipmentByOrderId = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { orderId } = req.params;
        
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        // Find order by ID
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (!order.shipping?.aramexWaybillNumber) {
            return res.status(400).json({
                success: false,
                message: 'No Aramex waybill number found for this order'
            });
        }

        // Track shipment using waybill number
        const trackingResult = await aramexService.trackShipment(order.shipping.aramexWaybillNumber);
        
        if (!trackingResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to track shipment',
                error: trackingResult.error
            });
        }

        // Update order with latest tracking information
        await updateOrderWithTracking(order.shipping.aramexWaybillNumber, trackingResult);

        res.status(200).json({
            success: true,
            message: 'Shipment tracked successfully',
            data: {
                orderId: order._id,
                waybillNumber: order.shipping.aramexWaybillNumber,
                tracking: trackingResult
            }
        });

    } catch (error) {
        console.error('Track shipment by order ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Create shipment for an order
 */
exports.createShipment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { orderId } = req.params;
        const { shipperData, consigneeData, shipmentDetails } = req.body;
        
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        // Find order by ID
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if shipment already exists
        if (order.shipping?.aramexWaybillNumber) {
            return res.status(400).json({
                success: false,
                message: 'Shipment already created for this order',
                waybillNumber: order.shipping.aramexWaybillNumber
            });
        }

        // Prepare shipment data
        const shipmentData = {
            shipper: shipperData || getDefaultShipperData(),
            consignee: consigneeData || getConsigneeDataFromOrder(order),
            details: shipmentDetails || getDefaultShipmentDetails(order),
            reference1: order.orderNumber,
            reference2: order._id.toString(),
            reference3: `DrinkMate-${order.orderNumber}`,
            comments: `Order #${order.orderNumber} - DrinkMate Products`,
            ...getDefaultShipmentData()
        };

        // Create shipment using Aramex service
        const shipmentResult = await aramexService.createShipment(shipmentData);
        
        if (!shipmentResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to create shipment',
                error: shipmentResult.error
            });
        }

        // Update order with shipment information
        const waybillNumber = shipmentResult.shipments[0]?.waybillNumber;
        const labelUrl = shipmentResult.shipments[0]?.labelUrl;

        if (waybillNumber) {
            order.shipping = {
                ...order.shipping,
                aramexWaybillNumber: waybillNumber,
                aramexLabelUrl: labelUrl,
                status: 'shipped',
                shippedAt: new Date(),
                trackingUrl: `${process.env.FRONTEND_URL || 'https://drinkmate-main-production.up.railway.app'}/track-order/${waybillNumber}`
            };

            await order.save();
        }

        res.status(201).json({
            success: true,
            message: 'Shipment created successfully',
            data: {
                orderId: order._id,
                waybillNumber: waybillNumber,
                labelUrl: labelUrl,
                trackingUrl: order.shipping.trackingUrl
            }
        });

    } catch (error) {
        console.error('Create shipment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get shipment history
 */
exports.getShipmentHistory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { waybillNumber } = req.params;
        
        if (!waybillNumber) {
            return res.status(400).json({
                success: false,
                message: 'Waybill number is required'
            });
        }

        // Get shipment history using Aramex service
        const historyResult = await aramexService.getShipmentHistory(waybillNumber);
        
        if (!historyResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to get shipment history',
                error: historyResult.error
            });
        }

        res.status(200).json({
            success: true,
            message: 'Shipment history retrieved successfully',
            data: historyResult
        });

    } catch (error) {
        console.error('Get shipment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all orders with tracking information
 */
exports.getOrdersWithTracking = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        // Build filter
        const filter = {
            'shipping.aramexWaybillNumber': { $exists: true, $ne: null }
        };

        if (status) {
            filter['shipping.status'] = status;
        }

        // Get orders with pagination
        const orders = await Order.find(filter)
            .select('orderNumber customer shipping status createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalOrders = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Orders with tracking retrieved successfully',
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalOrders / limit),
                    totalOrders,
                    hasNext: skip + orders.length < totalOrders,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get orders with tracking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update order with tracking information
 */
async function updateOrderWithTracking(waybillNumber, trackingResult) {
    try {
        const order = await Order.findOne({ 'shipping.aramexWaybillNumber': waybillNumber });
        
        if (order && trackingResult.shipments && trackingResult.shipments.length > 0) {
            const shipment = trackingResult.shipments[0];
            const trackingResults = shipment.trackingResults || [];

            // Update order with latest tracking information
            order.shipping = {
                ...order.shipping,
                trackingHistory: trackingResults,
                lastTrackingUpdate: new Date(),
                currentStatus: trackingResults.length > 0 ? trackingResults[0].updateDescription : 'Unknown'
            };

            await order.save();
        }
    } catch (error) {
        console.error('Error updating order with tracking:', error);
    }
}

/**
 * Get default shipper data
 */
function getDefaultShipperData() {
    return {
        reference1: 'DrinkMate',
        reference2: 'Main Warehouse',
        address: {
            line1: 'Industrial Area',
            line2: 'Building 123',
            city: 'Riyadh',
            state: 'Riyadh',
            postCode: '12345',
            countryCode: 'SA'
        },
        contact: {
            personName: 'DrinkMate Support',
            companyName: 'DrinkMate',
            phoneNumber1: '+966501234567',
            emailAddress: 'support@drinkmate.com'
        }
    };
}

/**
 * Get consignee data from order
 */
function getConsigneeDataFromOrder(order) {
    const shippingAddress = order.shippingAddress || {};
    
    return {
        reference1: order.orderNumber,
        reference2: order._id.toString(),
        address: {
            line1: shippingAddress.address1 || '',
            line2: shippingAddress.address2 || '',
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            postCode: shippingAddress.postalCode || '',
            countryCode: shippingAddress.country || 'SA'
        },
        contact: {
            personName: `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim(),
            companyName: shippingAddress.company || '',
            phoneNumber1: shippingAddress.phone || '',
            emailAddress: order.customer?.email || ''
        }
    };
}

/**
 * Get default shipment details
 */
function getDefaultShipmentDetails(order) {
    const totalWeight = order.lineItems?.reduce((total, item) => {
        return total + (item.quantity * (item.weight || 0.5)); // Default 0.5kg per item
    }, 0) || 1;

    return {
        dimensions: {
            length: 30,
            width: 20,
            height: 15,
            unit: 'CM'
        },
        actualWeight: {
            value: Math.max(totalWeight, 0.5),
            unit: 'KG'
        },
        productGroup: 'DOM',
        productType: 'ONX',
        paymentType: 'P',
        numberOfPieces: order.lineItems?.length || 1,
        descriptionOfGoods: `DrinkMate Products - Order #${order.orderNumber}`,
        goodsOriginCountry: 'SA'
    };
}

/**
 * Create pickup request
 */
exports.createPickup = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const pickupData = req.body;
        
        const pickupResult = await aramexService.createPickup(pickupData);
        
        if (!pickupResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to create pickup',
                error: pickupResult.error
            });
        }

        res.status(201).json({
            success: true,
            message: 'Pickup created successfully',
            data: pickupResult
        });

    } catch (error) {
        console.error('Create pickup error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Cancel pickup request
 */
exports.cancelPickup = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { pickupGUID } = req.params;
        const { comments } = req.body;
        
        if (!pickupGUID) {
            return res.status(400).json({
                success: false,
                message: 'Pickup GUID is required'
            });
        }

        const cancelResult = await aramexService.cancelPickup({
            pickupGUID,
            comments
        });
        
        if (!cancelResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to cancel pickup',
                error: cancelResult.error
            });
        }

        res.status(200).json({
            success: true,
            message: 'Pickup cancelled successfully',
            data: cancelResult
        });

    } catch (error) {
        console.error('Cancel pickup error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Print label
 */
exports.printLabel = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { waybillNumber } = req.params;
        const labelData = req.body;
        
        if (!waybillNumber) {
            return res.status(400).json({
                success: false,
                message: 'Waybill number is required'
            });
        }

        const printResult = await aramexService.printLabel({
            waybillNumber,
            ...labelData
        });
        
        if (!printResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to print label',
                error: printResult.error
            });
        }

        res.status(200).json({
            success: true,
            message: 'Label printed successfully',
            data: printResult
        });

    } catch (error) {
        console.error('Print label error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get default shipment data
 */
function getDefaultShipmentData() {
    return {
        transportType: 0,
        shippingDateTime: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        comments: 'DrinkMate Products Delivery',
        accountingInstructions: '',
        operationsInstructions: ''
    };
}
