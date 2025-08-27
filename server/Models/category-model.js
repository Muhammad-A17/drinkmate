const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the category schema
const CategorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        maxlength: [50, 'Category name cannot exceed 50 characters'],
        unique: true
    },
    slug: {
        type: String,
        required: [true, 'Category slug is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    image: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: '#12d6fa'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    productCount: {
        type: Number,
        default: 0
    },
    bundleCount: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for total items count
CategorySchema.virtual('totalItems').get(function() {
    return this.productCount + this.bundleCount;
});

// Pre-save middleware to generate slug if not provided
CategorySchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    next();
});

// Index for efficient queries
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ sortOrder: 1 });
CategorySchema.index({ parentCategory: 1 });

// Create the Category model
const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
