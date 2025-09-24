const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  
  // Personal Information
  name: {
    type: String,
    required: false,
    trim: true,
    maxlength: 100,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  
  // Address Information
  district: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    default: 'Saudi Arabia',
    trim: true
  },
  nationalAddress: {
    type: String,
    trim: true,
    match: [/^[A-Z]{4}[0-9]{4}$/, 'National Address must be 4 letters followed by 4 numbers (e.g., JESA3591)']
  },
  
  // Account Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked', 'pending'],
    default: 'active'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Role and Permissions
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  
  // Activity Tracking
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Preferences
  preferences: {
    language: {
      type: String,
      enum: ['en', 'ar'],
      default: 'en'
    },
    currency: {
      type: String,
      default: 'SAR'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Social Login (if implemented later)
  socialLogins: [{
    provider: {
      type: String,
      enum: ['google', 'facebook', 'apple']
    },
    providerId: String,
    providerEmail: String
  }],
  
  // Security
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
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

// Virtual for full name (now just returns the name field)
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Indexes for better performance (email and username already have unique indexes)
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    this.updatedAt = Date.now();
    return next();
  }

  try {
    // Hash the password with cost of 10
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  return userObject;
};

// Method to check if user is active
userSchema.methods.isActive = function() {
  return this.status === 'active' && this.emailVerified;
};

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate auth token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: this._id, 
      isAdmin: this.isAdmin 
    },
    process.env.JWT_SECRET || 'default_dev_secret',
    { expiresIn: '2d' }
  );
};

module.exports = mongoose.model('User', userSchema);