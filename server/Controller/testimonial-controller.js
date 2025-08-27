const Testimonial = require('../Models/testimonial-model');
const User = require('../Models/user-model');

// Get all testimonials with filtering options
exports.getAllTestimonials = async (req, res) => {
    try {
        // Build filter object
        const filter = { isActive: true };
        
        // Featured filter
        if (req.query.featured === 'true') {
            filter.featured = true;
        }
        
        // Product related filter
        if (req.query.productId) {
            filter.productRelated = req.query.productId;
        }
        
        // Bundle related filter
        if (req.query.bundleId) {
            filter.bundleRelated = req.query.bundleId;
        }
        
        // Verified filter
        if (req.query.verified === 'true') {
            filter.isVerified = true;
        }
        
        // Language filter
        if (req.query.language) {
            filter.language = req.query.language;
        }
        
        // Limit the number of testimonials
        const limit = parseInt(req.query.limit) || 0;
        
        // Execute query
        const testimonials = await Testimonial.find(filter)
            .sort({ displayOrder: 1, createdAt: -1 })
            .limit(limit || 0);
        
        res.status(200).json({
            success: true,
            count: testimonials.length,
            testimonials
        });
    } catch (error) {
        console.error('Error in getAllTestimonials:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get a single testimonial by ID
exports.getTestimonialById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const testimonial = await Testimonial.findById(id);
        
        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }
        
        res.status(200).json({
            success: true,
            testimonial
        });
    } catch (error) {
        console.error('Error in getTestimonialById:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Create a new testimonial (admin only)
exports.createTestimonial = async (req, res) => {
    try {
        const { 
            author, 
            role, 
            company, 
            text, 
            rating, 
            avatar, 
            avatarColor, 
            isVerified, 
            productRelated,
            bundleRelated,
            featured,
            language,
            translations
        } = req.body;
        
        // Create new testimonial
        const testimonial = new Testimonial({
            author,
            role,
            company,
            text,
            rating: rating || 5,
            avatar,
            avatarColor,
            isVerified: isVerified !== undefined ? isVerified : true,
            productRelated,
            bundleRelated,
            featured: featured || false,
            language: language || 'en',
            translations
        });
        
        await testimonial.save();
        
        res.status(201).json({
            success: true,
            message: 'Testimonial created successfully',
            testimonial
        });
    } catch (error) {
        console.error('Error in createTestimonial:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update a testimonial (admin only)
exports.updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if testimonial exists
        let testimonial = await Testimonial.findById(id);
        
        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }
        
        // Update testimonial
        testimonial = await Testimonial.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });
        
        res.status(200).json({
            success: true,
            message: 'Testimonial updated successfully',
            testimonial
        });
    } catch (error) {
        console.error('Error in updateTestimonial:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Delete a testimonial (admin only)
exports.deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if testimonial exists
        const testimonial = await Testimonial.findById(id);
        
        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }
        
        // Delete testimonial
        await Testimonial.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Testimonial deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteTestimonial:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Submit a new testimonial (user)
exports.submitTestimonial = async (req, res) => {
    try {
        const { text, rating, productId, bundleId } = req.body;
        
        if (!text || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Testimonial text and rating are required'
            });
        }
        
        // Get user information
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Create new testimonial
        const testimonial = new Testimonial({
            author: user.username,
            text,
            rating,
            isVerified: true, // Verified because it's from a registered user
            productRelated: productId,
            bundleRelated: bundleId,
            user: user._id,
            isActive: false // Requires admin approval
        });
        
        await testimonial.save();
        
        res.status(201).json({
            success: true,
            message: 'Testimonial submitted successfully (pending approval)',
            testimonial
        });
    } catch (error) {
        console.error('Error in submitTestimonial:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Approve a user-submitted testimonial (admin only)
exports.approveTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if testimonial exists
        let testimonial = await Testimonial.findById(id);
        
        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }
        
        // Update testimonial status
        testimonial.isActive = true;
        await testimonial.save();
        
        res.status(200).json({
            success: true,
            message: 'Testimonial approved successfully',
            testimonial
        });
    } catch (error) {
        console.error('Error in approveTestimonial:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
