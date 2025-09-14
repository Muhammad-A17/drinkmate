const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  ingredients: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: String,
      required: true,
      trim: true
    },
    unit: {
      type: String,
      trim: true
    }
  }],
  instructions: [{
    step: {
      type: Number,
      required: true
    },
    instruction: {
      type: String,
      required: true,
      trim: true
    }
  }],
  prepTime: {
    type: Number, // in minutes
    required: true,
    min: 0
  },
  cookTime: {
    type: Number, // in minutes
    required: true,
    min: 0
  },
  servings: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  category: {
    type: String,
    required: true,
    enum: ['Classic', 'Fruity', 'Creamy', 'Refreshing', 'Seasonal', 'Specialty']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
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
  featured: {
    type: Boolean,
    default: false
  },
  published: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
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
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    sugar: Number,
    fiber: Number
  },
  equipment: [{
    type: String,
    trim: true
  }],
  tips: [{
    type: String,
    trim: true
  }],
  variations: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    modifications: [{
      type: String,
      trim: true
    }]
  }],
  relatedRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
// Index already defined on slug field above
recipeSchema.index({ category: 1 });
recipeSchema.index({ featured: 1, published: 1 });
recipeSchema.index({ 'rating.average': -1 });
recipeSchema.index({ createdAt: -1 });

// Virtual for total time
recipeSchema.virtual('totalTime').get(function() {
  return this.prepTime + this.cookTime;
});

// Virtual for formatted time
recipeSchema.virtual('formattedTime').get(function() {
  const total = this.totalTime;
  if (total < 60) {
    return `${total}m`;
  }
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
});

// Pre-save middleware to generate slug
recipeSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Static method to find featured recipes
recipeSchema.statics.findFeatured = function(limit = 6) {
  return this.find({ featured: true, published: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'username firstName lastName');
};

// Static method to find by category
recipeSchema.statics.findByCategory = function(category, limit = 12) {
  return this.find({ category, published: true })
    .sort({ 'rating.average': -1, createdAt: -1 })
    .limit(limit)
    .populate('author', 'username firstName lastName');
};

// Instance method to increment views
recipeSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to update rating
recipeSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  const newTotal = currentTotal + newRating;
  const newCount = this.rating.count + 1;
  
  this.rating.average = newTotal / newCount;
  this.rating.count = newCount;
  
  return this.save();
};

// Add pagination plugin
recipeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Recipe', recipeSchema);
