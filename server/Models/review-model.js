const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the review schema
const ReviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    bundle: {
        type: Schema.Types.ObjectId,
        ref: 'Bundle'
    },
    co2Cylinder: {
        type: Schema.Types.ObjectId,
        ref: 'CO2Cylinder'
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    title: {
        type: String,
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        trim: true,
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            default: ''
        }
    }],
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    helpfulVotes: {
        type: Number,
        default: 0
    },
    unhelpfulVotes: {
        type: Number,
        default: 0
    },
    adminResponse: {
        comment: {
            type: String,
            trim: true
        },
        date: {
            type: Date
        }
    }
}, { timestamps: true });

// Validation to ensure either product, bundle, or co2Cylinder is provided
ReviewSchema.pre('validate', function(next) {
    if (!this.product && !this.bundle && !this.co2Cylinder) {
        this.invalidate('product', 'Either product, bundle, or co2Cylinder must be provided');
    }
    const providedCount = [this.product, this.bundle, this.co2Cylinder].filter(Boolean).length;
    if (providedCount > 1) {
        this.invalidate('product', 'Only one of product, bundle, or co2Cylinder should be provided');
    }
    next();
});

// Post-save hook to update product, bundle, or co2Cylinder rating
ReviewSchema.post('save', async function() {
    if (this.status === 'approved') {
        if (this.product) {
            await this.updateProductRating();
        } else if (this.bundle) {
            await this.updateBundleRating();
        } else if (this.co2Cylinder) {
            await this.updateCO2CylinderRating();
        }
    }
});

// Method to update product rating
ReviewSchema.methods.updateProductRating = async function() {
    const Product = mongoose.model('Product');
    const reviews = await mongoose.model('Review').find({ 
        product: this.product,
        status: 'approved'
    });
    
    if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        await Product.findByIdAndUpdate(this.product, {
            averageRating,
            reviewCount: reviews.length
        });
    }
};

// Method to update bundle rating
ReviewSchema.methods.updateBundleRating = async function() {
    const Bundle = mongoose.model('Bundle');
    const reviews = await mongoose.model('Review').find({ 
        bundle: this.bundle,
        status: 'approved'
    });
    
    if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        await Bundle.findByIdAndUpdate(this.bundle, {
            averageRating,
            reviewCount: reviews.length
        });
    }
};

// Method to update CO2 cylinder rating
ReviewSchema.methods.updateCO2CylinderRating = async function() {
    const CO2Cylinder = mongoose.model('CO2Cylinder');
    const reviews = await mongoose.model('Review').find({ 
        co2Cylinder: this.co2Cylinder,
        status: 'approved'
    });
    
    if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        await CO2Cylinder.findByIdAndUpdate(this.co2Cylinder, {
            averageRating,
            totalReviews: reviews.length
        });
    }
};

// Create compound indexes to prevent duplicate reviews and ensure efficient queries
ReviewSchema.index({ user: 1, product: 1 }, { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { product: { $exists: true } }
});

ReviewSchema.index({ user: 1, bundle: 1 }, { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { bundle: { $exists: true } }
});

ReviewSchema.index({ user: 1, co2Cylinder: 1 }, { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { co2Cylinder: { $exists: true } }
});

// Create a text index for search functionality
ReviewSchema.index({ 
    name: 'text', 
    description: 'text'
});

// Create the Review model
const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
