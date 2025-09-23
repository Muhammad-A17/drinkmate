const mongoose = require('mongoose');

const exchangeCylinderSchema = new mongoose.Schema({
  // Basic cylinder information
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameAr: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    enum: ['drinkmate', 'sodastream', 'errva', 'fawwar', 'phillips', 'ultima-cosa', 'bubble-bro', 'yoco-cosa', 'other']
  },
  
  // Exchange-specific information
  exchangeType: {
    type: String,
    required: true,
    enum: ['instant', 'scheduled', 'pickup', 'delivery'],
    default: 'instant'
  },
  serviceLevel: {
    type: String,
    required: true,
    enum: ['standard', 'premium', 'express', 'same-day'],
    default: 'standard'
  },
  estimatedTime: {
    type: String,
    required: true,
    default: 'Same Day'
  },
  pickupRequired: {
    type: Boolean,
    default: false
  },
  deliveryAvailable: {
    type: Boolean,
    default: true
  },
  exchangeRadius: {
    type: Number, // in kilometers
    default: 50
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
  exchangeFee: {
    type: Number,
    default: 0,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  pickupFee: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Cylinder specifications
  capacity: {
    type: Number, // in liters
    required: true
  },
  material: {
    type: String,
    default: 'steel',
    enum: ['steel', 'aluminum', 'composite']
  },
  weight: {
    type: Number, // in kg
    required: true
  },
  dimensions: {
    height: Number, // in cm
    diameter: Number, // in cm
    width: Number // in cm
  },
  
  // Compatibility
  compatibility: [{
    type: String,
    enum: ['drinkmate', 'sodastream', 'errva', 'fawwar', 'phillips', 'ultima-cosa', 'bubble-bro', 'yoco-cosa', 'universal']
  }],
  
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
  maxDailyExchanges: {
    type: Number,
    default: 100
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Images and media
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
  descriptionAr: {
    type: String
  },
  features: [String],
  benefits: [String],
  instructions: [String],
  
  // Technical specifications
  specifications: {
    pressure: String,
    threadType: String,
    valveType: String,
    certification: String,
    temperatureRange: String,
    serviceLife: String,
    refillCycles: String,
    safetyFeatures: String,
    workingPressure: Number,
    testPressure: Number,
    burstPressure: Number
  },
  
  // Safety and compliance
  safetyFeatures: [String],
  certifications: [String],
  complianceStandards: [String],
  safetyInstructions: [String],
  
  // Service details
  serviceAreas: [String], // Cities or regions where service is available
  operatingHours: {
    monday: { start: String, end: String, closed: Boolean },
    tuesday: { start: String, end: String, closed: Boolean },
    wednesday: { start: String, end: String, closed: Boolean },
    thursday: { start: String, end: String, closed: Boolean },
    friday: { start: String, end: String, closed: Boolean },
    saturday: { start: String, end: String, closed: Boolean },
    sunday: { start: String, end: String, closed: Boolean }
  },
  emergencyService: {
    type: Boolean,
    default: false
  },
  emergencyContact: String,
  
  // Status and metadata
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'discontinued'],
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
  
  // Ratings and reviews
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
  totalExchanges: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // SEO and marketing
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  
  // Exchange tracking
  lastExchangeDate: Date,
  nextMaintenanceDate: Date,
  maintenanceHistory: [{
    date: Date,
    type: String,
    description: String,
    performedBy: String
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
  timestamps: true
});

// Indexes for better query performance
exchangeCylinderSchema.index({ brand: 1, exchangeType: 1 });
exchangeCylinderSchema.index({ status: 1, isAvailable: 1 });
exchangeCylinderSchema.index({ price: 1 });
exchangeCylinderSchema.index({ isBestSeller: 1, isFeatured: 1 });
// slug index removed - already has unique: true which creates an index
exchangeCylinderSchema.index({ averageRating: -1 });
exchangeCylinderSchema.index({ totalReviews: -1 });
exchangeCylinderSchema.index({ createdAt: -1 });
exchangeCylinderSchema.index({ serviceAreas: 1 });
exchangeCylinderSchema.index({ exchangeType: 1, serviceLevel: 1 });

// Virtual for discount percentage
exchangeCylinderSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice > 0) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for final price after discount
exchangeCylinderSchema.virtual('finalPrice').get(function() {
  return this.price;
});

// Virtual for total service cost
exchangeCylinderSchema.virtual('totalServiceCost').get(function() {
  return this.price + this.exchangeFee + this.deliveryFee + this.pickupFee;
});

// Virtual for service availability
exchangeCylinderSchema.virtual('isServiceAvailable').get(function() {
  return this.status === 'active' && this.isAvailable && this.stock > 0;
});

// Pre-save middleware to update discount and generate slug
exchangeCylinderSchema.pre('save', function(next) {
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
exchangeCylinderSchema.methods.isLowStock = function() {
  return this.stock <= this.minStock;
};

// Method to update stock
exchangeCylinderSchema.methods.updateStock = function(quantity, operation = 'decrease') {
  if (operation === 'decrease') {
    this.stock = Math.max(0, this.stock - quantity);
  } else if (operation === 'increase') {
    this.stock += quantity;
  }
  return this.save();
};

// Method to update rating
exchangeCylinderSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.averageRating * this.totalReviews) + newRating;
  this.totalReviews += 1;
  this.averageRating = totalRating / this.totalReviews;
  return this.save();
};

// Method to record exchange
exchangeCylinderSchema.methods.recordExchange = function() {
  this.totalExchanges += 1;
  this.lastExchangeDate = new Date();
  return this.save();
};

// Method to get primary image
exchangeCylinderSchema.methods.getPrimaryImage = function() {
  return this.images && this.images.length > 0 ? this.images[0] : this.image;
};

// Method to get all images
exchangeCylinderSchema.methods.getAllImages = function() {
  const allImages = [];
  if (this.image) allImages.push(this.image);
  if (this.images) allImages.push(...this.images);
  return [...new Set(allImages)]; // Remove duplicates
};

// Method to check service availability in area
exchangeCylinderSchema.methods.isAvailableInArea = function(area) {
  return this.serviceAreas.length === 0 || this.serviceAreas.includes(area);
};

// Method to get operating hours for day
exchangeCylinderSchema.methods.getOperatingHours = function(dayOfWeek) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const day = days[dayOfWeek];
  return this.operatingHours[day] || { closed: true };
};

// Static method to find by slug
exchangeCylinderSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, status: 'active' });
};

// Static method to get active exchange cylinders
exchangeCylinderSchema.statics.getActive = function() {
  return this.find({ status: 'active', isAvailable: true }).sort({ createdAt: -1 });
};

// Static method to get best sellers
exchangeCylinderSchema.statics.getBestSellers = function(limit = 10) {
  return this.find({ status: 'active', isBestSeller: true }).limit(limit).sort({ averageRating: -1 });
};

// Static method to get featured products
exchangeCylinderSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ status: 'active', isFeatured: true }).limit(limit).sort({ createdAt: -1 });
};

// Static method to get by exchange type
exchangeCylinderSchema.statics.getByExchangeType = function(exchangeType) {
  return this.find({ status: 'active', exchangeType, isAvailable: true }).sort({ createdAt: -1 });
};

// Static method to get by service level
exchangeCylinderSchema.statics.getByServiceLevel = function(serviceLevel) {
  return this.find({ status: 'active', serviceLevel, isAvailable: true }).sort({ createdAt: -1 });
};

// Static method to get available in area
exchangeCylinderSchema.statics.getAvailableInArea = function(area) {
  return this.find({ 
    status: 'active', 
    isAvailable: true,
    $or: [
      { serviceAreas: { $size: 0 } }, // Available everywhere
      { serviceAreas: area } // Available in specific area
    ]
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('ExchangeCylinder', exchangeCylinderSchema);
