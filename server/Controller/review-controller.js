const Review = require('../Models/review-model');
const Product = require('../Models/product-model');
const Bundle = require('../Models/bundle-model');
const CO2Cylinder = require('../Models/co2-model');
const User = require('../Models/user-model');

// Get all reviews for admin (includes pending and rejected reviews)
exports.getAllReviewsAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        // Build filter object
        const filter = {};
        
        // Status filter
        if (req.query.status && req.query.status !== 'all') {
            filter.status = req.query.status;
        }
        
        // Rating filter
        if (req.query.rating && req.query.rating !== 'all') {
            filter.rating = parseInt(req.query.rating);
        }
        
        // Product filter
        if (req.query.productId) {
            filter.product = req.query.productId;
        }
        
        // Bundle filter
        if (req.query.bundleId) {
            filter.bundle = req.query.bundleId;
        }
        
        // CO2 Cylinder filter
        if (req.query.co2CylinderId) {
            filter.co2Cylinder = req.query.co2CylinderId;
        }
        
        // Verified purchase filter
        if (req.query.verified === 'true') {
            filter.isVerifiedPurchase = true;
        } else if (req.query.verified === 'false') {
            filter.isVerifiedPurchase = false;
        }
        
        // Search query
        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { comment: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        // Determine sort order
        let sort = {};
        switch(req.query.sort) {
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'oldest':
                sort = { createdAt: 1 };
                break;
            case 'rating_high':
                sort = { rating: -1 };
                break;
            case 'rating_low':
                sort = { rating: 1 };
                break;
            case 'helpful':
                sort = { helpfulVotes: -1 };
                break;
            default:
                sort = { createdAt: -1 };
        }
        
        // Execute query with pagination
        const reviews = await Review.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('user', 'username email firstName lastName')
            .populate('product', 'name images')
            .populate('bundle', 'name images')
            .populate('co2Cylinder', 'name images');
        
        // Get total count for pagination
        const totalReviews = await Review.countDocuments(filter);
        
        // Calculate total pages
        const totalPages = Math.ceil(totalReviews / limit);
        
        // Get review statistics
        const stats = await Review.aggregate([
            { $group: {
                _id: null,
                totalReviews: { $sum: 1 },
                averageRating: { $avg: '$rating' },
                pendingReviews: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                approvedReviews: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
                rejectedReviews: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
                verifiedPurchases: { $sum: { $cond: ['$isVerifiedPurchase', 1, 0] } }
            }}
        ]);
        
        res.status(200).json({
            success: true,
            count: reviews.length,
            totalReviews,
            totalPages,
            currentPage: page,
            stats: stats[0] || {
                totalReviews: 0,
                averageRating: 0,
                pendingReviews: 0,
                approvedReviews: 0,
                rejectedReviews: 0,
                verifiedPurchases: 0
            },
            reviews
        });
    } catch (error) {
        console.error('Error in getAllReviewsAdmin:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all reviews (public - only approved reviews)
exports.getAllReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter object - only approved reviews
        const filter = { status: 'approved' };
        
        // Product filter
        if (req.query.productId) {
            filter.product = req.query.productId;
        }
        
        // Bundle filter
        if (req.query.bundleId) {
            filter.bundle = req.query.bundleId;
        }
        
        // CO2 Cylinder filter
        if (req.query.co2CylinderId) {
            filter.co2Cylinder = req.query.co2CylinderId;
        }
        
        // Rating filter
        if (req.query.rating && req.query.rating !== 'all') {
            filter.rating = parseInt(req.query.rating);
        }
        
        // Verified purchase filter
        if (req.query.verified === 'true') {
            filter.isVerifiedPurchase = true;
        }
        
        // Determine sort order
        let sort = {};
        switch(req.query.sort) {
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'oldest':
                sort = { createdAt: 1 };
                break;
            case 'rating_high':
                sort = { rating: -1 };
                break;
            case 'rating_low':
                sort = { rating: 1 };
                break;
            case 'helpful':
                sort = { helpfulVotes: -1 };
                break;
            default:
                sort = { createdAt: -1 };
        }
        
        // Execute query with pagination
        const reviews = await Review.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('user', 'username firstName lastName')
            .populate('product', 'name images')
            .populate('bundle', 'name images')
            .populate('co2Cylinder', 'name images');
        
        // Get total count for pagination
        const totalReviews = await Review.countDocuments(filter);
        
        // Calculate total pages
        const totalPages = Math.ceil(totalReviews / limit);
        
        // Get average rating for the product/bundle/co2Cylinder
        let averageRating = 0;
        let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        if (filter.product || filter.bundle || filter.co2Cylinder) {
            const ratingStats = await Review.aggregate([
                { $match: filter },
                { $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    ratingDistribution: {
                        $push: '$rating'
                    }
                }}
            ]);
            
            if (ratingStats.length > 0) {
                averageRating = Math.round(ratingStats[0].averageRating * 10) / 10;
                ratingStats[0].ratingDistribution.forEach(rating => {
                    ratingDistribution[rating]++;
                });
            }
        }
        
        res.status(200).json({
            success: true,
            count: reviews.length,
            totalReviews,
            totalPages,
            currentPage: page,
            averageRating,
            ratingDistribution,
            reviews
        });
    } catch (error) {
        console.error('Error in getAllReviews:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get a single review by ID
exports.getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const review = await Review.findById(id)
            .populate('user', 'username email firstName lastName')
            .populate('product', 'name images')
            .populate('bundle', 'name images')
            .populate('co2Cylinder', 'name images');
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        // Check if review is approved or if user is admin
        if (review.status !== 'approved' && (!req.user || !req.user.isAdmin)) {
            return res.status(403).json({
                success: false,
                message: 'This review is not available'
            });
        }
        
        res.status(200).json({
            success: true,
            review
        });
    } catch (error) {
        console.error('Error in getReviewById:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Create a new review (authenticated users)
exports.createReview = async (req, res) => {
    try {
        const { 
            productId, 
            bundleId, 
            co2CylinderId, 
            rating, 
            title, 
            comment, 
            images 
        } = req.body;
        
        // Validate required fields
        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Rating and comment are required'
            });
        }
        
        // Validate that exactly one item is being reviewed
        const itemCount = [productId, bundleId, co2CylinderId].filter(Boolean).length;
        if (itemCount !== 1) {
            return res.status(400).json({
                success: false,
                message: 'Exactly one item (product, bundle, or CO2 cylinder) must be specified'
            });
        }
        
        // Check if user has already reviewed this item
        const existingReview = await Review.findOne({
            user: req.user._id,
            ...(productId && { product: productId }),
            ...(bundleId && { bundle: bundleId }),
            ...(co2CylinderId && { co2Cylinder: co2CylinderId })
        });
        
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this item'
            });
        }
        
        // Verify the item exists
        let item = null;
        if (productId) {
            item = await Product.findById(productId);
        } else if (bundleId) {
            item = await Bundle.findById(bundleId);
        } else if (co2CylinderId) {
            item = await CO2Cylinder.findById(co2CylinderId);
        }
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }
        
        // Create new review
        const review = new Review({
            user: req.user._id,
            ...(productId && { product: productId }),
            ...(bundleId && { bundle: bundleId }),
            ...(co2CylinderId && { co2Cylinder: co2CylinderId }),
            rating,
            title,
            comment,
            images: images || [],
            isVerifiedPurchase: true, // Assume verified if user is authenticated
            status: 'pending' // Requires admin approval
        });
        
        await review.save();
        
        // Populate the review for response
        await review.populate([
            { path: 'user', select: 'username firstName lastName' },
            { path: 'product', select: 'name images' },
            { path: 'bundle', select: 'name images' },
            { path: 'co2Cylinder', select: 'name images' }
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Review submitted successfully (pending approval)',
            review
        });
    } catch (error) {
        console.error('Error in createReview:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update a review (admin only)
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if review exists
        let review = await Review.findById(id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        // Update review
        review = await Review.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        }).populate([
            { path: 'user', select: 'username email firstName lastName' },
            { path: 'product', select: 'name images' },
            { path: 'bundle', select: 'name images' },
            { path: 'co2Cylinder', select: 'name images' }
        ]);
        
        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            review
        });
    } catch (error) {
        console.error('Error in updateReview:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Delete a review (admin only)
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if review exists
        const review = await Review.findById(id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        // Delete review
        await Review.findByIdAndDelete(id);
        
        // Update the item's rating if the review was approved
        if (review.status === 'approved') {
            if (review.product) {
                await review.updateProductRating();
            } else if (review.bundle) {
                await review.updateBundleRating();
            } else if (review.co2Cylinder) {
                await review.updateCO2CylinderRating();
            }
        }
        
        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteReview:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Approve a review (admin only)
exports.approveReview = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if review exists
        let review = await Review.findById(id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        // Update review status
        review.status = 'approved';
        await review.save();
        
        // Update the item's rating
        if (review.product) {
            await review.updateProductRating();
        } else if (review.bundle) {
            await review.updateBundleRating();
        } else if (review.co2Cylinder) {
            await review.updateCO2CylinderRating();
        }
        
        res.status(200).json({
            success: true,
            message: 'Review approved successfully',
            review
        });
    } catch (error) {
        console.error('Error in approveReview:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Reject a review (admin only)
exports.rejectReview = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if review exists
        let review = await Review.findById(id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        // Update review status
        review.status = 'rejected';
        await review.save();
        
        res.status(200).json({
            success: true,
            message: 'Review rejected successfully',
            review
        });
    } catch (error) {
        console.error('Error in rejectReview:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Add admin response to a review (admin only)
exports.addAdminResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        
        if (!comment) {
            return res.status(400).json({
                success: false,
                message: 'Admin response comment is required'
            });
        }
        
        // Check if review exists
        let review = await Review.findById(id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        // Add admin response
        review.adminResponse = {
            comment,
            date: new Date()
        };
        
        await review.save();
        
        res.status(200).json({
            success: true,
            message: 'Admin response added successfully',
            review
        });
    } catch (error) {
        console.error('Error in addAdminResponse:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Vote on review helpfulness (authenticated users)
exports.voteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { helpful } = req.body; // true for helpful, false for not helpful
        
        if (typeof helpful !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Helpful value must be true or false'
            });
        }
        
        // Check if review exists
        let review = await Review.findById(id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        // Check if review is approved
        if (review.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Cannot vote on unapproved reviews'
            });
        }
        
        // Update vote count
        if (helpful) {
            review.helpfulVotes += 1;
        } else {
            review.unhelpfulVotes += 1;
        }
        
        await review.save();
        
        res.status(200).json({
            success: true,
            message: 'Vote recorded successfully',
            review: {
                _id: review._id,
                helpfulVotes: review.helpfulVotes,
                unhelpfulVotes: review.unhelpfulVotes
            }
        });
    } catch (error) {
        console.error('Error in voteReview:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Bulk operations (admin only)
exports.bulkUpdateReviews = async (req, res) => {
    try {
        const { reviewIds, action, data } = req.body;
        
        if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Review IDs array is required'
            });
        }
        
        if (!action) {
            return res.status(400).json({
                success: false,
                message: 'Action is required'
            });
        }
        
        let updateData = {};
        let message = '';
        
        switch (action) {
            case 'approve':
                updateData = { status: 'approved' };
                message = 'Reviews approved successfully';
                break;
            case 'reject':
                updateData = { status: 'rejected' };
                message = 'Reviews rejected successfully';
                break;
            case 'delete':
                await Review.deleteMany({ _id: { $in: reviewIds } });
                return res.status(200).json({
                    success: true,
                    message: 'Reviews deleted successfully',
                    deletedCount: reviewIds.length
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid action'
                });
        }
        
        const result = await Review.updateMany(
            { _id: { $in: reviewIds } },
            updateData
        );
        
        // If approving reviews, update item ratings
        if (action === 'approve') {
            const approvedReviews = await Review.find({ _id: { $in: reviewIds } });
            for (const review of approvedReviews) {
                if (review.product) {
                    await review.updateProductRating();
                } else if (review.bundle) {
                    await review.updateBundleRating();
                } else if (review.co2Cylinder) {
                    await review.updateCO2CylinderRating();
                }
            }
        }
        
        res.status(200).json({
            success: true,
            message,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error in bulkUpdateReviews:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
