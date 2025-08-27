const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the subcategory schema
const SubcategorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Subcategory name is required'],
        trim: true,
        maxlength: [50, 'Subcategory name cannot exceed 50 characters']
    },
    slug: {
        type: String,
        required: [true, 'Subcategory slug is required'],
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
        default: '#6b7280'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Parent category is required']
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
SubcategorySchema.virtual('totalItems').get(function() {
    return this.productCount + this.bundleCount;
});

// Pre-save middleware to generate slug if not provided
SubcategorySchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    next();
});

// Compound index to ensure unique subcategory names within a category
SubcategorySchema.index({ category: 1, name: 1 }, { unique: true });
SubcategorySchema.index({ category: 1, slug: 1 }, { unique: true });
SubcategorySchema.index({ isActive: 1 });
SubcategorySchema.index({ sortOrder: 1 });

// Create the Subcategory model
const Subcategory = mongoose.model('Subcategory', SubcategorySchema);

module.exports = Subcategory;
