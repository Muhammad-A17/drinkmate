const Blog = require('../Models/blog-model');
const User = require('../Models/user-model');

// Get all blog posts with pagination, filtering, and sorting
exports.getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter object
        const filter = { isPublished: true };
        
        // Category filter
        if (req.query.category && req.query.category !== 'all') {
            filter.category = req.query.category;
        }
        
        // Language filter
        if (req.query.language) {
            filter.language = req.query.language;
        }
        
        // Search query
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }
        
        // Tag filter
        if (req.query.tag) {
            filter.tags = req.query.tag;
        }
        
        // Determine sort order
        let sort = {};
        switch(req.query.sort) {
            case 'newest':
                sort = { publishDate: -1 };
                break;
            case 'oldest':
                sort = { publishDate: 1 };
                break;
            case 'popular':
                sort = { views: -1 };
                break;
            default:
                sort = { publishDate: -1 };
        }
        
        // Get featured post separately if requested
        let featuredPost = null;
        if (req.query.includeFeatured === 'true') {
            featuredPost = await Blog.findOne({ isPublished: true, isFeatured: true })
                .sort({ publishDate: -1 })
                .select('-content');
        }
        
        // Execute query with pagination
        const posts = await Blog.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('-content'); // Exclude content for list view
            
        // Get total count for pagination
        const totalPosts = await Blog.countDocuments(filter);
        
        // Calculate total pages
        const totalPages = Math.ceil(totalPosts / limit);
        
        // Get all available categories
        const categories = await Blog.distinct('category', { isPublished: true });
        
        res.status(200).json({
            success: true,
            count: posts.length,
            totalPosts,
            totalPages,
            currentPage: page,
            featuredPost,
            categories: ['all', ...categories],
            posts
        });
    } catch (error) {
        console.error('Error in getAllPosts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get a single blog post by ID or slug
exports.getPost = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        
        // Check if the parameter is an ObjectId or a slug
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
        
        let post;
        if (isObjectId) {
            post = await Blog.findById(idOrSlug);
        } else {
            post = await Blog.findOne({ slug: idOrSlug });
        }
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }
        
        // Check if the post is published or if the user is an admin
        if (!post.isPublished && (!req.user || !req.user.isAdmin)) {
            return res.status(403).json({
                success: false,
                message: 'This post is not published yet'
            });
        }
        
        // Increment view count
        post.views += 1;
        await post.save();
        
        // Get related posts
        let relatedPosts = [];
        if (post.relatedPosts && post.relatedPosts.length > 0) {
            relatedPosts = await Blog.find({
                _id: { $in: post.relatedPosts },
                isPublished: true
            }).select('title slug excerpt image publishDate readTime');
        } else {
            // If no related posts are specified, get posts in the same category
            relatedPosts = await Blog.find({
                _id: { $ne: post._id },
                category: post.category,
                isPublished: true
            })
            .sort({ publishDate: -1 })
            .limit(3)
            .select('title slug excerpt image publishDate readTime');
        }
        
        res.status(200).json({
            success: true,
            post,
            relatedPosts
        });
    } catch (error) {
        console.error('Error in getPost:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Create a new blog post (admin only)
exports.createPost = async (req, res) => {
    try {
        const { 
            title, 
            excerpt, 
            content, 
            category, 
            tags, 
            image, 
            isPublished, 
            isFeatured,
            language,
            translations
        } = req.body;
        
        // Check if post with same title already exists
        const existingPost = await Blog.findOne({ title });
        
        if (existingPost) {
            return res.status(400).json({
                success: false,
                message: 'Blog post with this title already exists'
            });
        }
        
        // Create new post
        const post = new Blog({
            title,
            excerpt,
            content,
            author: req.user._id,
            authorName: req.user.username,
            category,
            tags: tags || [],
            image,
            readTime: calculateReadTime(content),
            isPublished: isPublished || false,
            isFeatured: isFeatured || false,
            publishDate: isPublished ? new Date() : null,
            language: language || 'en',
            translations: translations || {}
        });
        
        await post.save();
        
        res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            post
        });
    } catch (error) {
        console.error('Error in createPost:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update a blog post (admin only)
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if post exists
        let post = await Blog.findById(id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }
        
        // If title is being updated, check for duplicates
        if (req.body.title && req.body.title !== post.title) {
            const existingPost = await Blog.findOne({
                title: req.body.title,
                _id: { $ne: id }
            });
            
            if (existingPost) {
                return res.status(400).json({
                    success: false,
                    message: 'Blog post with this title already exists'
                });
            }
        }
        
        // If publishing for the first time, set publish date
        if (req.body.isPublished && !post.isPublished) {
            req.body.publishDate = new Date();
        }
        
        // If content is being updated, recalculate read time
        if (req.body.content) {
            req.body.readTime = calculateReadTime(req.body.content);
        }
        
        // Update post
        post = await Blog.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
        
        res.status(200).json({
            success: true,
            message: 'Blog post updated successfully',
            post
        });
    } catch (error) {
        console.error('Error in updatePost:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Delete a blog post (admin only)
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if post exists
        const post = await Blog.findById(id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }
        
        // Delete post
        await Blog.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (error) {
        console.error('Error in deletePost:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Add comment to a blog post
exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        
        if (!comment) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }
        
        const post = await Blog.findById(id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }
        
        // Add comment
        post.comments.push({
            user: req.user._id,
            username: req.user.username,
            comment,
            isApproved: false // Comments require approval
        });
        
        await post.save();
        
        res.status(200).json({
            success: true,
            message: 'Comment added successfully (pending approval)',
            comment: post.comments[post.comments.length - 1]
        });
    } catch (error) {
        console.error('Error in addComment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Approve a comment (admin only)
exports.approveComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        
        const post = await Blog.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }
        
        // Find the comment
        const comment = post.comments.id(commentId);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        // Approve comment
        comment.isApproved = true;
        await post.save();
        
        res.status(200).json({
            success: true,
            message: 'Comment approved successfully'
        });
    } catch (error) {
        console.error('Error in approveComment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Like a blog post
exports.likePost = async (req, res) => {
    try {
        const { id } = req.params;
        
        const post = await Blog.findById(id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }
        
        // Increment likes
        post.likes += 1;
        await post.save();
        
        res.status(200).json({
            success: true,
            message: 'Post liked successfully',
            likes: post.likes
        });
    } catch (error) {
        console.error('Error in likePost:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Helper function to calculate read time
const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, readTime); // Minimum 1 minute read time
};
