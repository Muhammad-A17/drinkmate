const mongoose = require('mongoose');

const co2CylinderSchema = new mongoose.Schema({
  // Basic cylinder information
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    enum: ['drinkmate', 'sodastream', 'errva', 'fawwar', 'phillips', 'ultima-cosa', 'bubble-bro', 'yoco-cosa', 'other']
  },
  type: {
    type: String,
    required: true,
    enum: ['refill', 'exchange', 'new', 'conversion']
  },
  
  // Pricing information
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Compatibility and specifications
  compatibility: [{
    type: String,
    enum: ['drinkmate', 'sodastream', 'errva', 'fawwar', 'phillips', 'ultima-cosa', 'bubble-bro', 'yoco-cosa', 'universal']
  }],
  capacity: {
    type: Number, // in liters
    required: true
  },
  material: {
    type: String,
    default: 'steel'
  },
  
  // Inventory management
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  minStock: {
    type: Number,
    default: 10
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Image and media
  image: {
    type: String,
    required: true
  },
  images: [String],
  videos: [String],
  documents: [{
    name: String,
    url: String,
    type: String
  }],
  
  // Description and details
  description: {
    type: String,
    required: true
  },
  features: [String],
  specifications: {
    weight: Number,
    height: Number,
    diameter: Number,
    pressure: String,
    threadType: String,
    valveType: String,
    certification: String,
    temperatureRange: String,
    serviceLife: String,
    refillCycles: String,
    safetyFeatures: String
  },
  dimensions: {
    width: Number,
    height: Number,
    depth: Number,
    weight: Number
  },
  safetyFeatures: [String],
  certifications: [String],
  
  // Status and metadata
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewProduct: {
    type: Boolean,
    default: false
  },
  isEcoFriendly: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // SEO and marketing
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  
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
  timestamps: true
});

// Indexes for better query performance
co2CylinderSchema.index({ brand: 1, type: 1 });
co2CylinderSchema.index({ status: 1, isAvailable: 1 });
co2CylinderSchema.index({ price: 1 });
co2CylinderSchema.index({ isBestSeller: 1, isFeatured: 1 });
// slug index removed - already has unique: true which creates an index
co2CylinderSchema.index({ averageRating: -1 });
co2CylinderSchema.index({ totalReviews: -1 });
co2CylinderSchema.index({ createdAt: -1 });

// Virtual for discount percentage
co2CylinderSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice > 0) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for final price after discount
co2CylinderSchema.virtual('finalPrice').get(function() {
  return this.price;
});

// Pre-save middleware to update discount and generate slug
co2CylinderSchema.pre('save', function(next) {
  if (this.originalPrice > 0 && this.price < this.originalPrice) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  
  // Generate slug if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }
  
  this.updatedAt = new Date();
  next();
});

// Method to check if stock is low
co2CylinderSchema.methods.isLowStock = function() {
  return this.stock <= this.minStock;
};

// Method to update stock
co2CylinderSchema.methods.updateStock = function(quantity, operation = 'decrease') {
  if (operation === 'decrease') {
    this.stock = Math.max(0, this.stock - quantity);
  } else if (operation === 'increase') {
    this.stock += quantity;
  }
  return this.save();
};

// Method to update rating
co2CylinderSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.averageRating * this.totalReviews) + newRating;
  this.totalReviews += 1;
  this.averageRating = totalRating / this.totalReviews;
  return this.save();
};

// Method to get primary image
co2CylinderSchema.methods.getPrimaryImage = function() {
  return this.images && this.images.length > 0 ? this.images[0] : this.image;
};

// Method to get all images
co2CylinderSchema.methods.getAllImages = function() {
  const allImages = [];
  if (this.image) allImages.push(this.image);
  if (this.images) allImages.push(...this.images);
  return [...new Set(allImages)]; // Remove duplicates
};

// Static method to find by slug
co2CylinderSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, status: 'active' });
};

// Static method to get active cylinders
co2CylinderSchema.statics.getActive = function() {
  return this.find({ status: 'active', isAvailable: true }).sort({ createdAt: -1 });
};

// Static method to get best sellers
co2CylinderSchema.statics.getBestSellers = function(limit = 10) {
  return this.find({ status: 'active', isBestSeller: true }).limit(limit).sort({ averageRating: -1 });
};

// Static method to get featured products
co2CylinderSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ status: 'active', isFeatured: true }).limit(limit).sort({ createdAt: -1 });
};

module.exports = mongoose.model('CO2Cylinder', co2CylinderSchema);
