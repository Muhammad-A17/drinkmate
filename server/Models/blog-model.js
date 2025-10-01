const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the blog post schema
const BlogSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    excerpt: {
        type: String,
        required: [true, 'Blog excerpt is required'],
        trim: true,
        maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    content: {
        type: String,
        required: [true, 'Blog content is required']
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Blog author is required']
    },
    authorName: {
        type: String,
        required: [true, 'Author name is required']
    },
    category: {
        type: String,
        required: [true, 'Blog category is required'],
        enum: ['recipes', 'science', 'guide', 'products', 'environment', 'health', 'lifestyle'],
        default: 'guide'
    },
    tags: [{
        type: String,
        trim: true
    }],
    image: {
        type: String,
        required: [true, 'Featured image is required']
    },
    readTime: {
        type: Number,
        required: [true, 'Read time is required'],
        min: [1, 'Read time must be at least 1 minute']
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false // Allow null for public comments
        },
        username: {
            type: String,
            required: true
        },
        comment: {
            type: String,
            required: true,
            trim: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        isApproved: {
            type: Boolean,
            default: false
        }
    }],
    relatedPosts: [{
        type: Schema.Types.ObjectId,
        ref: 'Blog'
    }],
    seoMetadata: {
        metaTitle: {
            type: String,
            maxlength: [60, 'Meta title cannot exceed 60 characters']
        },
        metaDescription: {
            type: String,
            maxlength: [160, 'Meta description cannot exceed 160 characters']
        },
        keywords: {
            type: [String]
        }
    },
    language: {
        type: String,
        enum: ['en', 'ar'],
        default: 'en'
    },
    translations: {
        type: Map,
        of: {
            title: String,
            excerpt: String,
            content: String,
            seoMetadata: {
                metaTitle: String,
                metaDescription: String,
                keywords: [String]
            }
        }
    }
}, { timestamps: true });

// Pre-save hook to generate slug if not provided
BlogSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
    }
    
    // Generate SEO metadata if not provided
    if (!this.seoMetadata.metaTitle) {
        this.seoMetadata.metaTitle = this.title.substring(0, 60);
    }
    
    if (!this.seoMetadata.metaDescription) {
        this.seoMetadata.metaDescription = this.excerpt.substring(0, 160);
    }
    
    next();
});

// Create a text index for search functionality
BlogSchema.index({ 
    title: 'text', 
    excerpt: 'text', 
    content: 'text',
    tags: 'text',
    category: 'text'
});

// Create the Blog model
const Blog = mongoose.model('Blog', BlogSchema);

module.exports = Blog;
