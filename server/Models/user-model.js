const mongoose = require('mongoose');
const bcrypt = require('bcrypt');   
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    avatar: {
        type: String,
        default: '/images/default-avatar.png'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'blocked'],
        default: 'active'
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    lastLogin: {
        type: Date,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    }
}, { timestamps: true });

// Hash password before saving user
UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate JWT token method    
UserSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { id: this._id, isAdmin: this.isAdmin },
        process.env.JWT_SECRET || 'default_dev_secret',
        { expiresIn: '1h' }
    );
    return token;
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
        
    // Token expires in 1 hour
    this.resetPasswordExpires = Date.now() + 3600000; 
    
    return resetToken;
};

// Create User model
const User = mongoose.model('User', UserSchema);

module.exports = User;
