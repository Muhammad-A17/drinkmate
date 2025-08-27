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

// Validation to ensure either product or bundle is provided
ReviewSchema.pre('validate', function(next) {
    if (!this.product && !this.bundle) {
        this.invalidate('product', 'Either product or bundle must be provided');
    }
    if (this.product && this.bundle) {
        this.invalidate('product', 'Only one of product or bundle should be provided');
    }
    next();
});

// Post-save hook to update product or bundle rating
ReviewSchema.post('save', async function() {
    if (this.status === 'approved') {
        if (this.product) {
            await this.updateProductRating();
        } else if (this.bundle) {
            await this.updateBundleRating();
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

// Create a text index for search functionality
ReviewSchema.index({ 
    name: 'text', 
    description: 'text'
});

// Create the Review model
const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
