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
  
  // Description and details
  description: {
    type: String,
    required: true
  },
  features: [String],
  specifications: {
    weight: Number,
    height: Number,
    diameter: Number
  },
  
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

// Pre-save middleware to update discount
co2CylinderSchema.pre('save', function(next) {
  if (this.originalPrice > 0 && this.price < this.originalPrice) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
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

module.exports = mongoose.model('CO2Cylinder', co2CylinderSchema);
