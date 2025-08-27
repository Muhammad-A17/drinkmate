// models/contact-model.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ContactSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true
    },
    phone: {
        type: String,
        required: false,
        trim: true
    },
    subject: {
        type: String,
        enum: ['general', 'product', 'support', 'order', 'refund', 'other'],
        default: 'general'
    },
    status: {
        type: String,
        enum: ['new', 'in_progress', 'resolved', 'closed'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // linked to a registered user
        required: false
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // admin/staff user assigned to handle this contact
        required: false
    },
    notes: [{
        text: {
            type: String,
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    response: {
        text: {
            type: String
        },
        sentAt: {
            type: Date
        },
        sentBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    language: {
        type: String,
        enum: ['en', 'ar'],
        default: 'en'
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Create a text index for search functionality
ContactSchema.index({ 
    name: 'text', 
    email: 'text', 
    message: 'text',
    subject: 'text'
});

const Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;
