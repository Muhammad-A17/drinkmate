const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the coupon schema
const CouponSchema = new Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    description: {
        type: String,
        required: [true, 'Coupon description is required'],
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: [true, 'Discount type is required']
    },
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: [0, 'Discount value cannot be negative']
    },
    minimumPurchase: {
        type: Number,
        default: 0,
        min: [0, 'Minimum purchase cannot be negative']
    },
    maximumDiscount: {
        type: Number,
        min: [0, 'Maximum discount cannot be negative']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        default: Date.now
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    usageLimit: {
        type: Number,
        min: [0, 'Usage limit cannot be negative']
    },
    usageCount: {
        type: Number,
        default: 0
    },
    perUserLimit: {
        type: Number,
        default: 1,
        min: [1, 'Per user limit must be at least 1']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableProducts: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    applicableCategories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }],
    excludedProducts: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    firstTimeOnly: {
        type: Boolean,
        default: false
    },
    userRestrictions: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: []
    }
}, { timestamps: true });

// Method to check if coupon is valid
CouponSchema.methods.isValid = function(user, cartTotal) {
    const now = new Date();
    
    // Check if coupon is active and within date range
    if (!this.isActive || now < this.startDate || now > this.endDate) {
        return { valid: false, message: 'Coupon is not active or expired' };
    }
    
    // Check if coupon has reached usage limit
    if (this.usageLimit && this.usageCount >= this.usageLimit) {
        return { valid: false, message: 'Coupon usage limit reached' };
    }
    
    // Check minimum purchase requirement
    if (cartTotal < this.minimumPurchase) {
        return { valid: false, message: `Minimum purchase of ${this.minimumPurchase} required` };
    }
    
    // Check user restrictions
    if (user && this.userRestrictions.length > 0 && !this.userRestrictions.includes(user._id)) {
        return { valid: false, message: 'Coupon not available for this user' };
    }
    
    return { valid: true };
};

// Method to calculate discount amount
CouponSchema.methods.calculateDiscount = function(cartTotal) {
    let discountAmount = 0;
    
    if (this.discountType === 'percentage') {
        discountAmount = (cartTotal * this.discountValue) / 100;
        
        // Apply maximum discount cap if specified
        if (this.maximumDiscount && discountAmount > this.maximumDiscount) {
            discountAmount = this.maximumDiscount;
        }
    } else {
        // Fixed discount
        discountAmount = this.discountValue;
        
        // Ensure discount doesn't exceed cart total
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }
    }
    
    return discountAmount;
};

// Create the Coupon model
const Coupon = mongoose.model('Coupon', CouponSchema);

module.exports = Coupon;
