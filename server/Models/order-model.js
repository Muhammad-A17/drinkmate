const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the order schema
const OrderSchema = new Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        },
        bundle: {
            type: Schema.Types.ObjectId,
            ref: 'Bundle'
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1']
        },
        color: String,
        image: String,
        sku: String
    }],
    shippingAddress: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        address1: {
            type: String,
            required: true
        },
        address2: String,
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true,
            default: 'Saudi Arabia'
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    billingAddress: {
        sameAsShipping: {
            type: Boolean,
            default: true
        },
        firstName: String,
        lastName: String,
        address1: String,
        address2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        phone: String,
        email: String
    },
    paymentMethod: {
        type: String,
        enum: ['urways', 'tap_payment', 'credit_card', 'debit_card', 'apple_pay', 'google_pay', 'samsung_pay', 'bank_transfer', 'cash_on_delivery'],
        required: true
    },
    deliveryOption: {
        type: String,
        enum: ['standard', 'express', 'economy'],
        default: 'standard'
    },
    cardDetails: {
        cardNumber: String,
        cardholderName: String,
        expiryMonth: String,
        expiryYear: String,
        cvv: String
    },
    paymentDetails: {
        transactionId: String,
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
            default: 'pending'
        },
        paymentDate: Date,
        cardLast4: String,
        cardBrand: String,
        receiptUrl: String
    },
    subtotal: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number,
        required: true,
        default: 0
    },
    tax: {
        type: Number,
        required: true,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    coupon: {
        code: String,
        discountAmount: Number,
        couponId: {
            type: Schema.Types.ObjectId,
            ref: 'Coupon'
        }
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'on_hold'],
        default: 'pending'
    },
    trackingNumber: String,
    trackingUrl: String,
    carrier: String,
    estimatedDeliveryDate: Date,
    deliveredDate: Date,
    cancelReason: String,
    notes: String,
    packingInstructions: String,
    giftMessage: String,
    isGift: {
        type: Boolean,
        default: false
    },
    refunds: [{
        amount: Number,
        reason: String,
        date: {
            type: Date,
            default: Date.now
        },
        transactionId: String
    }]
}, { timestamps: true });

// Generate order number before saving
OrderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        // Generate a unique order number with year, month, day and a random 4-digit number
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
        
        this.orderNumber = `DM${year}${month}${day}-${random}`;
        
        // Check if the order number already exists
        const Order = mongoose.model('Order');
        const existingOrder = await Order.findOne({ orderNumber: this.orderNumber });
        
        if (existingOrder) {
            // If it exists, generate a new random number and try again
            return this.pre('save', next);
        }
    }
    next();
});

// Virtual for order age in days
OrderSchema.virtual('ageInDays').get(function() {
    const now = new Date();
    const createdAt = new Date(this.createdAt);
    const diffTime = Math.abs(now - createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Create the Order model
const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
