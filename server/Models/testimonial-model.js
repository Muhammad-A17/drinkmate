const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the testimonial schema
const TestimonialSchema = new Schema({
    author: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true
    },
    role: {
        type: String,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    text: {
        type: String,
        required: [true, 'Testimonial text is required'],
        trim: true,
        maxlength: [1000, 'Testimonial text cannot exceed 1000 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        default: 5
    },
    avatar: {
        type: String
    },
    avatarInitial: {
        type: String,
        maxlength: [1, 'Avatar initial must be a single character']
    },
    avatarColor: {
        type: String,
        default: '#12d6fa'
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    productRelated: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    bundleRelated: {
        type: Schema.Types.ObjectId,
        ref: 'Bundle'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    language: {
        type: String,
        enum: ['en', 'ar'],
        default: 'en'
    },
    translations: {
        type: Map,
        of: {
            author: String,
            role: String,
            company: String,
            text: String
        }
    }
}, { timestamps: true });

// Generate avatar initial if not provided
TestimonialSchema.pre('save', function(next) {
    if (!this.avatarInitial && this.author) {
        this.avatarInitial = this.author.charAt(0).toUpperCase();
    }
    next();
});

// Create a text index for search functionality
TestimonialSchema.index({ 
    author: 'text', 
    role: 'text', 
    company: 'text',
    text: 'text'
});

// Create the Testimonial model
const Testimonial = mongoose.model('Testimonial', TestimonialSchema);

module.exports = Testimonial;
