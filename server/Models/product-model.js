const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  nameAr: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  descriptionAr: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Product Details
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: true,
    enum: ['energy-drink', 'cola', 'flavored-water', 'accessories', 'merchandise'],
    default: 'energy-drink'
  },
  subcategory: {
    type: String,
    trim: true
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'SAR',
    enum: ['SAR', 'USD', 'EUR']
  },
  
  // Inventory
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  trackInventory: {
    type: Boolean,
    default: true
  },
  
  // Product Images
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Product Variants
  variants: [{
    name: {
      type: String,
      required: true
    },
    nameAr: String,
    value: {
      type: String,
      required: true
    },
    valueAr: String,
    priceAdjustment: {
      type: Number,
      default: 0
    },
    stock: {
      type: Number,
      default: 0
    }
  }],
  
  // Physical Properties
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['g', 'kg', 'ml', 'l'],
      default: 'g'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    }
  },
  
  // Nutritional Information
  nutritionalInfo: {
    calories: Number,
    sugar: Number,
    caffeine: Number,
    sodium: Number,
    ingredients: [String],
    allergens: [String],
    servingSize: String
  },
  
  // SEO and Marketing
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  metaTitle: String,
  metaDescription: String,
  tags: [String],
  
  // Status and Visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'discontinued'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  newArrival: {
    type: Boolean,
    default: false
  },
  bestSeller: {
    type: Boolean,
    default: false
  },
  
  // Sales and Analytics
  salesCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Reviews
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: String,
    comment: String,
    verified: {
      type: Boolean,
      default: false
    },
    helpful: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Virtual for availability
productSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.stock > 0;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Indexes for better performance (slug already has unique index)
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ status: 1, featured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ salesCount: -1 });

// Pre-save middleware
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate slug if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  next();
});

// Method to check if product is in stock
productSchema.methods.isInStock = function(quantity = 1) {
  if (!this.trackInventory) return true;
  return this.stock >= quantity;
};

// Method to update stock
productSchema.methods.updateStock = function(quantity, operation = 'subtract') {
  if (!this.trackInventory) return this;
  
  if (operation === 'subtract') {
    this.stock = Math.max(0, this.stock - quantity);
  } else if (operation === 'add') {
    this.stock += quantity;
  }
  
  return this.save();
};

// Method to add review
productSchema.methods.addReview = function(userId, rating, title, comment) {
  const review = {
    user: userId,
    rating,
    title,
    comment,
    createdAt: new Date()
  };
  
  this.reviews.push(review);
  
  // Update average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = totalRating / this.reviews.length;
  this.rating.count = this.reviews.length;
  
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);