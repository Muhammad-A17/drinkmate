const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the bundle schema
const BundleSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Bundle name is required'],
        trim: true,
        maxlength: [100, 'Bundle name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Bundle description is required'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price cannot be negative']
    },
    bundleDiscount: {
        type: Number,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%']
    },
    images: [{
        type: String,
        required: false
    }],
    badge: {
        text: {
            type: String,
            trim: true
        },
        color: {
            type: String,
            default: '#12d6fa'
        }
    },
    items: [{
        product: {
            type: String,
            required: false
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative']
        },
        image: {
            type: String,
            required: false
        }
    }],
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    subcategory: {
        type: String,
        required: [true, 'Subcategory is required']
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative']
    },
    sku: {
        type: String,
        required: false,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isNewArrival: {
        type: Boolean,
        default: false
    },
    isBestSeller: {
        type: Boolean,
        default: false
    },
    isLimited: {
        type: Boolean,
        default: false
    },
    averageRating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5']
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    seoMetadata: {
        metaTitle: {
            type: String,
            maxlength: [60, 'Meta title cannot exceed 60 characters']
        },
        metaDescription: {
            type: String,
            maxlength: [160, 'Meta description cannot exceed 160 characters']
        },
        keywords: {
            type: [String]
        }
    }
}, { timestamps: true });

// Create a virtual for the discount percentage
BundleSchema.virtual('discountPercentage').get(function() {
    if (this.originalPrice && this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});

// Create a text index for search functionality
BundleSchema.index({ 
    name: 'text', 
    description: 'text'
});

// Pre-save hook to generate slug if not provided
BundleSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
    }
    next();
});

// Create the Bundle model
const Bundle = mongoose.model('Bundle', BundleSchema);

module.exports = Bundle;
