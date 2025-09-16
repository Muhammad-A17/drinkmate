const mongoose = require('mongoose');

const chatSettingsSchema = new mongoose.Schema({
  // General settings
  isEnabled: {
    type: Boolean,
    default: true
  },
  
  // Working hours
  workingHours: {
    start: {
      type: String,
      required: true,
      default: '09:00',
      validate: {
        validator: function(v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Start time must be in HH:MM format'
      }
    },
    end: {
      type: String,
      required: true,
      default: '17:00',
      validate: {
        validator: function(v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'End time must be in HH:MM format'
      }
    }
  },
  
  // Timezone
  timezone: {
    type: String,
    required: true,
    default: 'Asia/Riyadh',
    validate: {
      validator: function(v) {
        // Basic timezone validation - could be enhanced with a proper timezone list
        return typeof v === 'string' && v.length > 0;
      },
      message: 'Timezone must be a valid string'
    }
  },
  
  // Agent settings
  autoAssign: {
    type: Boolean,
    default: true
  },
  
  maxConcurrentChats: {
    type: Number,
    default: 5,
    min: 1,
    max: 20
  },
  
  // Contact channels
  whatsappNumber: {
    type: String,
    default: '+966501234567',
    validate: {
      validator: function(v) {
        return /^\+[1-9]\d{1,14}$/.test(v);
      },
      message: 'WhatsApp number must be in international format (+1234567890)'
    }
  },
  
  emailAddress: {
    type: String,
    default: 'support@drinkmates.com',
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email must be a valid email address'
    }
  },
  
  // Messages
  offlineMessage: {
    type: String,
    default: 'Our chat support is currently offline. Please use our contact form or email us.',
    maxLength: 500
  },
  
  // SLA settings
  slaSettings: {
    firstResponseTime: {
      type: Number,
      default: 300, // 5 minutes in seconds
      min: 60,
      max: 3600
    },
    resolutionTime: {
      type: Number,
      default: 3600, // 1 hour in seconds
      min: 300,
      max: 86400
    }
  },
  
  // Advanced settings
  advancedSettings: {
    enableNotifications: {
      type: Boolean,
      default: true
    },
    enableTypingIndicators: {
      type: Boolean,
      default: true
    },
    enableFileUploads: {
      type: Boolean,
      default: true
    },
    maxFileSize: {
      type: Number,
      default: 10485760, // 10MB in bytes
      min: 1048576, // 1MB
      max: 52428800 // 50MB
    }
  },
  
  // Metadata
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  versionKey: false
});

// Ensure only one settings document exists
chatSettingsSchema.index({}, { unique: true });

// Static method to get current settings
chatSettingsSchema.statics.getCurrentSettings = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    // Create default settings if none exist
    settings = new this({
      lastUpdatedBy: new mongoose.Types.ObjectId('000000000000000000000000') // Default admin ID
    });
    await settings.save();
  }
  
  return settings;
};

// Static method to update settings
chatSettingsSchema.statics.updateSettings = async function(updates, userId) {
  const settings = await this.getCurrentSettings();
  
  // Update fields - handle nested objects properly
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
        // Handle nested objects like workingHours
        if (settings[key]) {
          Object.assign(settings[key], updates[key]);
        } else {
          settings[key] = updates[key];
        }
      } else {
        // Handle primitive values
        settings[key] = updates[key];
      }
    }
  });
  
  settings.lastUpdatedBy = userId;
  settings.version += 1;
  
  await settings.save();
  return settings;
};

// Method to check if chat is online
chatSettingsSchema.methods.isChatOnline = function() {
  if (!this.isEnabled) return false;
  
  // Use server timezone for accurate time calculation
  const now = new Date();
  const serverTime = new Date(now.toLocaleString("en-US", { timeZone: this.timezone }));
  const currentHour = serverTime.getHours();
  const currentMinute = serverTime.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  const [startHour, startMinute] = this.workingHours.start.split(':').map(Number);
  const [endHour, endMinute] = this.workingHours.end.split(':').map(Number);
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  // Handle 24/7 case (00:00 to 23:59)
  if (startTime === 0 && endTime === 1439) {
    return true;
  }
  
  // Handle overnight shifts (e.g., 22:00 to 06:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime < endTime;
  }
  
  // Normal case (e.g., 09:00 to 17:00)
  return currentTime >= startTime && currentTime < endTime;
};

module.exports = mongoose.model('ChatSettings', chatSettingsSchema);
