const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the product schema
const ProductSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    fullDescription: {
        type: String,
        required: [true, 'Full description is required']
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
    discount: {
        type: Number,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%']
    },
    category: {
        type: String, // Temporarily changed to String for development
        required: [true, 'Category is required']
    },
    subcategory: {
        type: String,
        trim: true
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            default: ''
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    colors: [{
        name: {
            type: String,
            required: true
        },
        hexCode: {
            type: String,
            required: true
        },
        inStock: {
            type: Boolean,
            default: true
        }
    }],
    features: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        icon: {
            type: String
        }
    }],
    specifications: [{
        name: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        }
    }],
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative']
    },
    sku: {
        type: String,
        required: [true, 'SKU is required'],
        unique: true,
        trim: true
    },
    weight: {
        type: Number,
        min: [0, 'Weight cannot be negative']
    },
    dimensions: {
        length: {
            type: Number,
            min: [0, 'Length cannot be negative']
        },
        width: {
            type: Number,
            min: [0, 'Width cannot be negative']
        },
        height: {
            type: Number,
            min: [0, 'Height cannot be negative']
        }
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
    relatedProducts: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    howToUse: {
        title: {
            type: String
        },
        steps: [{
            id: {
                type: String
            },
            title: {
                type: String
            },
            description: {
                type: String
            },
            image: {
                type: String
            }
        }]
    },
    faqs: [{
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        }
    }],
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
ProductSchema.virtual('discountPercentage').get(function() {
    if (this.originalPrice && this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});

// Create a text index for search functionality
ProductSchema.index({ 
    name: 'text', 
    shortDescription: 'text', 
    fullDescription: 'text',
    'specifications.name': 'text',
    'specifications.value': 'text'
});

// Pre-save hook to generate slug if not provided
ProductSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
    }
    next();
});

// Create the Product model
const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
