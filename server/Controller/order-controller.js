const Order = require('../Models/order-model');
const Product = require('../Models/product-model');
const Bundle = require('../Models/bundle-model');
const Coupon = require('../Models/coupon-model');
const User = require('../Models/user-model');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, billingAddress, paymentMethod, couponCode, packingInstructions, isGift, giftMessage } = req.body;
        
        // Validate required fields
        if (!items || items.length === 0 || !shippingAddress || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Calculate order totals
        let subtotal = 0;
        let discount = 0;
        const processedItems = [];
        
        // Process each item in the order
        for (const item of items) {
            let itemData = null;
            
            // Check if product or bundle exists and is in stock
            if (item.product) {
                const product = await Product.findById(item.product);
                
                if (!product) {
                    console.error(`Product validation failed: Product with ID ${item.product} not found in database`);
                    console.error(`Available products in database:`, await Product.find({}, '_id name').limit(5));
                    return res.status(404).json({
                        success: false,
                        message: `Product "${item.name || 'Unknown'}" is no longer available. Please remove it from your cart and try again.`,
                        code: 'PRODUCT_NOT_FOUND',
                        productId: item.product
                    });
                }
                
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Not enough stock for product: ${product.name}`
                    });
                }
                
                // Update stock
                product.stock -= item.quantity;
                await product.save();
                
                // Calculate item total
                const itemTotal = product.price * item.quantity;
                subtotal += itemTotal;
                
                // Add to processed items
                itemData = {
                    product: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    color: item.color,
                    image: product.images.find(img => img.isPrimary)?.url || product.images[0]?.url,
                    sku: product.sku
                };
            } else if (item.bundle) {
                const bundle = await Bundle.findById(item.bundle);
                
                if (!bundle) {
                    console.error(`Bundle validation failed: Bundle with ID ${item.bundle} not found in database`);
                    console.error(`Available bundles in database:`, await Bundle.find({}, '_id name').limit(5));
                    return res.status(404).json({
                        success: false,
                        message: `Bundle "${item.name || 'Unknown'}" is no longer available. Please remove it from your cart and try again.`,
                        code: 'BUNDLE_NOT_FOUND',
                        bundleId: item.bundle
                    });
                }
                
                if (bundle.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Not enough stock for bundle: ${bundle.name}`
                    });
                }
                
                // Update stock
                bundle.stock -= item.quantity;
                await bundle.save();
                
                // Calculate item total
                const itemTotal = bundle.price * item.quantity;
                subtotal += itemTotal;
                
                // Add to processed items
                itemData = {
                    bundle: bundle._id,
                    name: bundle.name,
                    price: bundle.price,
                    quantity: item.quantity,
                    image: bundle.images.find(img => img.isPrimary)?.url || bundle.images[0]?.url,
                    sku: bundle.sku
                };
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Each item must have either product or bundle ID'
                });
            }
            
            processedItems.push(itemData);
        }
        
        // Apply coupon if provided
        let couponData = null;
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
            
            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid or expired coupon code'
                });
            }
            
            // Validate coupon
            const validationResult = coupon.isValid(req.user, subtotal);
            if (!validationResult.valid) {
                return res.status(400).json({
                    success: false,
                    message: validationResult.message
                });
            }
            
            // Calculate discount
            discount = coupon.calculateDiscount(subtotal);
            
            // Update coupon usage
            coupon.usageCount += 1;
            await coupon.save();
            
            couponData = {
                code: coupon.code,
                discountAmount: discount,
                couponId: coupon._id
            };
        }
        
        // Calculate shipping cost (simplified example)
        const shippingCost = subtotal > 500 ? 0 : 50;
        
        // Calculate tax (simplified example - 15% VAT)
        const taxRate = 0.15;
        const tax = (subtotal - discount) * taxRate;
        
        // Calculate total
        const total = subtotal - discount + shippingCost + tax;
        
        // Create the order
        const order = new Order({
            user: req.user._id,
            items: processedItems,
            shippingAddress,
            billingAddress: billingAddress || { sameAsShipping: true },
            paymentMethod,
            subtotal,
            discount,
            shippingCost,
            tax,
            total,
            coupon: couponData,
            packingInstructions,
            isGift,
            giftMessage
        });
        
        await order.save();
        
        // Process payment based on payment method
        if (paymentMethod === 'urways') {
            // For Urways, we'll create the order first and process payment separately
            // The frontend will handle the payment flow
            order.paymentDetails = {
                paymentStatus: 'pending',
                paymentDate: new Date()
            };
            order.status = 'pending';
        } else if (paymentMethod === 'cash_on_delivery') {
            // For cash on delivery, mark as pending
            order.paymentDetails = {
                paymentStatus: 'pending',
                paymentDate: new Date()
            };
            order.status = 'pending';
        } else {
            // For other payment methods, simulate successful payment
            order.paymentDetails = {
                transactionId: `TRANS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                paymentStatus: 'paid',
                paymentDate: new Date()
            };
            order.status = 'processing';
        }
        
        await order.save();
        
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        console.error('Error in createOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get orders for current user
exports.getUserOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        const totalOrders = await Order.countDocuments({ user: req.user._id });
        const totalPages = Math.ceil(totalOrders / limit);
        
        res.status(200).json({
            success: true,
            count: orders.length,
            totalOrders,
            totalPages,
            currentPage: page,
            orders
        });
    } catch (error) {
        console.error('Error in getUserOrders:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get a single order by ID
exports.getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        
        const order = await Order.findById(id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Check if the order belongs to the current user or if the user is an admin
        if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this order'
            });
        }
        
        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Error in getOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Track order by order number and email
exports.trackOrder = async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required for tracking'
            });
        }
        
        const order = await Order.findOne({ 
            orderNumber,
            'shippingAddress.email': email.toLowerCase()
        });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or email does not match'
            });
        }
        
        // Get tracking history
        const trackingHistory = await getOrderTrackingHistory(order);
        
        // Return tracking information for public access
        const trackingInfo = {
            orderNumber: order.orderNumber,
            status: order.status,
            trackingNumber: order.trackingNumber,
            trackingUrl: order.trackingUrl,
            carrier: order.carrier,
            estimatedDeliveryDate: order.estimatedDeliveryDate,
            deliveredDate: order.deliveredDate,
            createdAt: order.createdAt,
            currentLocation: getCurrentLocation(order),
            trackingHistory: trackingHistory,
            items: order.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                image: item.image
            })),
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            tax: order.tax,
            discount: order.discount,
            total: order.total
        };
        
        res.status(200).json({
            success: true,
            tracking: trackingInfo
        });
    } catch (error) {
        console.error('Error in trackOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get recent orders for a customer (requires authentication)
exports.getRecentOrders = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('orderNumber status items subtotal total createdAt');
            
        // Format orders for the frontend
        const formattedOrders = orders.map(order => ({
            id: order.orderNumber,
            date: order.createdAt.toISOString().split('T')[0],
            status: order.status,
            items: order.items.map(item => item.name),
            total: `${order.total.toFixed(2)} SAR`
        }));
        
        res.status(200).json({
            success: true,
            orders: formattedOrders
        });
    } catch (error) {
        console.error('Error in getRecentOrders:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all orders for a customer (requires authentication)
exports.getAllUserOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter object
        const filter = { user: req.user._id };
        
        // Status filter
        if (req.query.status) {
            filter.status = req.query.status;
        }
        
        // Date range filter
        if (req.query.startDate || req.query.endDate) {
            filter.createdAt = {};
            if (req.query.startDate) {
                filter.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.createdAt.$lte = new Date(req.query.endDate);
            }
        }
        
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('orderNumber status items subtotal total createdAt estimatedDeliveryDate trackingNumber');
            
        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);
        
        // Format orders for the frontend
        const formattedOrders = orders.map(order => ({
            id: order.orderNumber,
            date: order.createdAt.toISOString().split('T')[0],
            status: order.status,
            items: order.items.map(item => item.name),
            total: `${order.total.toFixed(2)} SAR`,
            trackingNumber: order.trackingNumber || null,
            estimatedDelivery: order.estimatedDeliveryDate ? order.estimatedDeliveryDate.toISOString().split('T')[0] : null
        }));
        
        res.status(200).json({
            success: true,
            count: formattedOrders.length,
            totalOrders,
            totalPages,
            currentPage: page,
            orders: formattedOrders
        });
    } catch (error) {
        console.error('Error in getAllUserOrders:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Helper function to get order tracking history
const getOrderTrackingHistory = async (order) => {
    const history = [];
    
    // Order placed
    history.push({
        date: order.createdAt.toISOString().split('T')[0],
        time: new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Order Placed',
        location: 'Online'
    });
    
    // Processing
    if (['processing', 'shipped', 'delivered'].includes(order.status)) {
        // Assume processing starts 1 day after order is placed
        const processingDate = new Date(order.createdAt);
        processingDate.setDate(processingDate.getDate() + 1);
        
        history.push({
            date: processingDate.toISOString().split('T')[0],
            time: new Date(processingDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'Processing',
            location: 'Warehouse'
        });
    }
    
    // Shipped
    if (['shipped', 'delivered'].includes(order.status)) {
        // If we have a specific shipping date, use it
        // Otherwise assume shipping starts 2 days after order is placed
        const shippedDate = order.shippedDate || new Date(order.createdAt);
        if (!order.shippedDate) {
            shippedDate.setDate(shippedDate.getDate() + 2);
        }
        
        history.push({
            date: shippedDate.toISOString().split('T')[0],
            time: new Date(shippedDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'Shipped',
            location: 'Shipping Center'
        });
    }
    
    // In Transit (only if shipped and not delivered)
    if (order.status === 'shipped') {
        // Assume in transit 1 day after shipping
        const inTransitDate = order.shippedDate || new Date(order.createdAt);
        inTransitDate.setDate(inTransitDate.getDate() + 3);
        
        history.push({
            date: inTransitDate.toISOString().split('T')[0],
            time: new Date(inTransitDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'In Transit',
            location: getCurrentLocation(order) || 'Distribution Center'
        });
    }
    
    // Delivered
    if (order.status === 'delivered' && order.deliveredDate) {
        history.push({
            date: order.deliveredDate.toISOString().split('T')[0],
            time: new Date(order.deliveredDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'Delivered',
            location: `${order.shippingAddress.city}, ${order.shippingAddress.country}`
        });
    }
    
    return history;
};

// Helper function to get current location based on order status
const getCurrentLocation = (order) => {
    switch (order.status) {
        case 'pending':
            return 'Order Processing';
        case 'processing':
            return 'Warehouse';
        case 'shipped':
            return order.carrier ? `${order.carrier} Distribution Center` : 'Distribution Center';
        case 'delivered':
            return `${order.shippingAddress.city}, ${order.shippingAddress.country}`;
        case 'cancelled':
            return 'Order Cancelled';
        default:
            return 'Unknown';
    }
};

// Cancel an order
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancelReason } = req.body;
        
        const order = await Order.findById(id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Check if the order belongs to the current user
        if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }
        
        // Check if the order can be cancelled
        if (!['pending', 'processing'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'This order cannot be cancelled'
            });
        }
        
        // Update order status
        order.status = 'cancelled';
        order.cancelReason = cancelReason || 'Customer cancelled';
        await order.save();
        
        // Restore stock for each item
        for (const item of order.items) {
            if (item.product) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            } else if (item.bundle) {
                await Bundle.findByIdAndUpdate(item.bundle, {
                    $inc: { stock: item.quantity }
                });
            }
        }
        
        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error('Error in cancelOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter object
        const filter = {};
        
        // Status filter
        if (req.query.status) {
            filter.status = req.query.status;
        }
        
        // Date range filter
        if (req.query.startDate || req.query.endDate) {
            filter.createdAt = {};
            if (req.query.startDate) {
                filter.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.createdAt.$lte = new Date(req.query.endDate);
            }
        }
        
        // Search by order number
        if (req.query.search) {
            filter.orderNumber = { $regex: req.query.search, $options: 'i' };
        }
        
        const orders = await Order.find(filter)
            .populate('user', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);
        
        res.status(200).json({
            success: true,
            count: orders.length,
            totalOrders,
            totalPages,
            currentPage: page,
            orders
        });
    } catch (error) {
        console.error('Error in getAllOrders:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, shippingStatus, trackingNumber, trackingUrl, carrier, estimatedDeliveryDate } = req.body;
        
        const order = await Order.findById(id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Update order fields
        if (status) order.status = status;
        if (shippingStatus) order.shippingStatus = shippingStatus;
        
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (trackingUrl) order.trackingUrl = trackingUrl;
        if (carrier) order.carrier = carrier;
        if (estimatedDeliveryDate) order.estimatedDeliveryDate = estimatedDeliveryDate;
        
        // If status is delivered, set delivered date
        if (status === 'delivered') {
            order.deliveredDate = new Date();
        }
        
        await order.save();
        
        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Validate coupon code
exports.validateCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        
        if (!code || !cartTotal) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code and cart total are required'
            });
        }
        
        const coupon = await Coupon.findOne({ code, isActive: true });
        
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired coupon code'
            });
        }
        
        // Check if coupon is valid
        const validationResult = coupon.isValid(req.user, cartTotal);
        
        if (!validationResult.valid) {
            return res.status(400).json({
                success: false,
                message: validationResult.message
            });
        }
        
        // Calculate discount amount
        const discountAmount = coupon.calculateDiscount(cartTotal);
        
        res.status(200).json({
            success: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount
            }
        });
    } catch (error) {
        console.error('Error in validateCoupon:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
