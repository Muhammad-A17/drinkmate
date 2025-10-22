const Product = require('../Models/product-model');
const Category = require('../Models/category-model');
const Bundle = require('../Models/bundle-model');
const Review = require('../Models/review-model');

// Get all products for admin with all fields
exports.getAdminProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter object based on query parameters
        const filter = {};
        
        // Category filter
        if (req.query.category) {
            const category = await Category.findOne({ slug: req.query.category });
            if (category) {
                // Support products where category is stored as ObjectId, stringified id, slug, or name
                filter.$or = [
                    { category: category._id },
                    { category: category._id.toString() },
                    { category: category.slug },
                    { category: category.name }
                ];
            }
        }
        
        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
        }
        
        // Color filter
        if (req.query.color) {
            filter['colors.name'] = req.query.color;
        }
        
        // Featured products filter
        if (req.query.featured === 'true') {
            filter.featured = true;
        }
        
        // Best sellers filter
        if (req.query.bestSeller === 'true') {
            filter.bestSeller = true;
        }
        
        // New arrivals filter
        if (req.query.newArrival === 'true') {
            filter.newArrival = true;
        }
        
        // Search query
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }
        
        // Determine sort order
        let sort = {};
        switch(req.query.sort) {
            case 'price_asc':
                sort = { price: 1 };
                break;
            case 'price_desc':
                sort = { price: -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'rating':
                sort = { averageRating: -1 };
                break;
            case 'popularity':
                sort = { reviewCount: -1 };
                break;
            default:
                sort = { createdAt: -1 };
        }
        
        // Execute query with pagination - return ALL fields for admin
        const products = await Product.find(filter)
            .populate('category', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();
            
        // Get total count for pagination
        const totalProducts = await Product.countDocuments(filter);
        
        // Calculate total pages
        const totalPages = Math.ceil(totalProducts / limit);
        
        res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            totalPages,
            currentPage: page,
            products
        });
    } catch (error) {
        console.error('Error in getAdminProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

// Get all products with pagination, filtering and sorting
exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter object based on query parameters
        const filter = { 
            status: 'active',
            stock: { $gt: 0 }
        };
        
        // Category filter
        if (req.query.category) {
            const category = await Category.findOne({ slug: req.query.category });
            if (category) {
                // Support products where category is stored as ObjectId, stringified id, slug, or name
                filter.$or = [
                    { category: category._id },
                    { category: category._id.toString() },
                    { category: category.slug },
                    { category: category.name }
                ];
            }
        }
        
        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
        }
        
        // Color filter
        if (req.query.color) {
            filter['colors.name'] = req.query.color;
        }
        
        // Featured products filter
        if (req.query.featured === 'true') {
            filter.isFeatured = true;
        }
        
        // Best sellers filter
        if (req.query.bestSeller === 'true') {
            filter.isBestSeller = true;
        }
        
        // New arrivals filter
        if (req.query.newArrival === 'true') {
            filter.isNewArrival = true;
        }
        
        // Search query
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }
        
        // Determine sort order
        let sort = {};
        switch(req.query.sort) {
            case 'price_asc':
                sort = { price: 1 };
                break;
            case 'price_desc':
                sort = { price: -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'rating':
                sort = { averageRating: -1 };
                break;
            case 'popularity':
                sort = { reviewCount: -1 };
                break;
            default:
                sort = { createdAt: -1 };
        }
        
        // Execute query with pagination
        const products = await Product.find(filter)
            .select('name slug price originalPrice images averageRating reviewCount category shortDescription')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();
            
        // Manually populate category field for products
        for (let product of products) {
            if (product.category && typeof product.category === 'string') {
                // If category is a string, try to find the category by slug or name
                const category = await Category.findOne({
                    $or: [
                        { slug: product.category },
                        { name: product.category },
                        { _id: product.category }
                    ]
                });
                if (category) {
                    product.category = {
                        _id: category._id,
                        name: category.name,
                        slug: category.slug
                    };
                }
            }
        }
            
        // Get total count for pagination
        const totalProducts = await Product.countDocuments(filter);
        
        // Calculate total pages
        const totalPages = Math.ceil(totalProducts / limit);
        
        res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            totalPages,
            currentPage: page,
            products
        });
    } catch (error) {
        console.error('Error in getAllProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get a single product by ID or slug
exports.getProduct = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        
        // Check if the parameter is an ObjectId or a slug
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
        
        let product;
        if (isObjectId) {
            product = await Product.findById(idOrSlug);
        } else {
            product = await Product.findOne({ slug: idOrSlug });
        }
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Populate category
        await product.populate('category', 'name slug');
        
        // Get reviews for this product
        const reviews = await Review.find({ 
            product: product._id,
            status: 'approved'
        })
        .populate('user', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(5);
        
        res.status(200).json({
            success: true,
            product,
            reviews
        });
    } catch (error) {
        console.error('Error in getProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        console.log('Creating product with data:', JSON.stringify(req.body, null, 2));
        
        // Validate required fields
        if (!req.body.name || req.body.name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Product name is required'
            });
        }
        
        if (!req.body.price || isNaN(parseFloat(req.body.price)) || parseFloat(req.body.price) < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid price is required'
            });
        }

        // Check if product with same name or SKU already exists
        const existingProduct = await Product.findOne({
            $or: [
                { name: req.body.name },
                { sku: req.body.sku }
            ]
        });
        
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Product with this name or SKU already exists'
            });
        }
        
        // Map frontend data to schema format
        const productData = {
            name: req.body.name.trim(),
            nameAr: req.body.nameAr?.trim(),
            description: req.body.description || req.body.shortDescription || req.body.name,
            descriptionAr: req.body.descriptionAr?.trim(),
            shortDescription: req.body.shortDescription?.trim(),
            fullDescription: req.body.fullDescription?.trim(),
            sku: req.body.sku?.trim() || undefined,
            category: req.body.category?.trim() || 'energy-drink',
            subcategory: req.body.subcategory?.trim(),
            price: parseFloat(req.body.price),
            originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined,
            currency: req.body.currency || 'SAR',
            stock: req.body.stock !== undefined ? parseInt(req.body.stock) : 0,
            lowStockThreshold: req.body.lowStockThreshold ? parseInt(req.body.lowStockThreshold) : 10,
            trackInventory: req.body.trackInventory !== false,
            
            // Map images from array of strings to array of objects
            images: Array.isArray(req.body.images) ? req.body.images.filter(img => {
                if (typeof img === 'string') {
                    return img && img.trim() !== '';
                } else if (img && typeof img === 'object' && img.url) {
                    return img.url && img.url.trim() !== '';
                }
                return false;
            }).map((img, index) => {
                if (typeof img === 'string') {
                    return {
                        url: img.trim(),
                        alt: req.body.name || 'Product image',
                        isPrimary: index === 0
                    };
                }
                return img; // Already an object
            }) : [],
            
            // Map colors from array of strings to array of objects
            colors: Array.isArray(req.body.colors) ? req.body.colors.map(color => {
                if (typeof color === 'string') {
                    return {
                        name: color,
                        inStock: true
                    };
                }
                return color; // Already an object
            }) : [],
            
            // Map weight and dimensions
            weight: req.body.weight ? {
                value: parseFloat(req.body.weight.value || req.body.weight),
                unit: req.body.weight.unit || 'g'
            } : undefined,
            
            dimensions: req.body.dimensions ? {
                length: req.body.dimensions.length ? parseFloat(req.body.dimensions.length) : 0,
                width: req.body.dimensions.width ? parseFloat(req.body.dimensions.width) : 0,
                height: req.body.dimensions.height ? parseFloat(req.body.dimensions.height) : 0,
                unit: req.body.dimensions.unit || 'cm'
            } : undefined,
            
            // Map status flags
            featured: req.body.isFeatured || req.body.featured || false,
            newArrival: req.body.isNewProduct || req.body.isNewArrival || req.body.newArrival || false,
            bestSeller: req.body.isBestSeller || req.body.bestSeller || false,
            
            // Other fields
            status: req.body.status || 'active',
            metaTitle: req.body.metaTitle,
            metaDescription: req.body.metaDescription,
            tags: req.body.tags || []
        };
        
        console.log('Mapped product data:', JSON.stringify(productData, null, 2));
        
        // Create new product
        const product = new Product(productData);
        
        try {
            await product.save();
            console.log('Product created successfully:', product._id);
        } catch (saveError) {
            console.error('Save error:', saveError);
            
            // Handle specific validation errors
            if (saveError.name === 'ValidationError') {
                const validationErrors = Object.values(saveError.errors).map((err) => err.message);
                console.error('Validation errors:', validationErrors);
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            // Handle duplicate key errors
            if (saveError.code === 11000) {
                const field = Object.keys(saveError.keyPattern)[0];
                return res.status(400).json({
                    success: false,
                    message: `Product with this ${field} already exists`
                });
            }

            throw saveError;
        }
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Error in createProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update a product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('Updating product with ID:', id);
        console.log('Update request body:', JSON.stringify(req.body, null, 2));
        
        // Check if product exists
        let product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Map frontend data to schema format
        const updateData = {};
        
        // Basic fields
        if (req.body.name !== undefined) updateData.name = req.body.name;
        if (req.body.nameAr !== undefined) updateData.nameAr = req.body.nameAr;
        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.descriptionAr !== undefined) updateData.descriptionAr = req.body.descriptionAr;
        if (req.body.shortDescription !== undefined) updateData.shortDescription = req.body.shortDescription;
        if (req.body.fullDescription !== undefined) updateData.fullDescription = req.body.fullDescription;
        if (req.body.category !== undefined) updateData.category = req.body.category;
        if (req.body.subcategory !== undefined) updateData.subcategory = req.body.subcategory;
        
        // Pricing
        if (req.body.price !== undefined) updateData.price = parseFloat(req.body.price) || 0;
        if (req.body.originalPrice !== undefined) updateData.originalPrice = req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined;
        if (req.body.currency !== undefined) updateData.currency = req.body.currency;
        
        // Inventory
        if (req.body.stock !== undefined) updateData.stock = req.body.stock !== undefined ? parseInt(req.body.stock) : undefined;
        if (req.body.lowStockThreshold !== undefined) updateData.lowStockThreshold = parseInt(req.body.lowStockThreshold) || 10;
        if (req.body.trackInventory !== undefined) updateData.trackInventory = req.body.trackInventory;
        
        // SKU handling
        if (req.body.sku !== undefined) {
            if (!req.body.sku || (typeof req.body.sku === 'string' && req.body.sku.trim() === '')) {
                const base = (req.body.name || product.name || 'prod')
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '')
                    .slice(0, 4);
                updateData.sku = `${base}-${Date.now().toString().slice(-6)}`;
            } else {
                updateData.sku = req.body.sku;
            }
        }
        
        // Check for duplicate name or SKU
        if (updateData.name || updateData.sku) {
            const existingProduct = await Product.findOne({
                $or: [
                    { name: updateData.name || product.name, _id: { $ne: id } },
                    { sku: updateData.sku || product.sku, _id: { $ne: id } }
                ]
            });
            
            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: 'Product with this name or SKU already exists'
                });
            }
        }
        
        // Map images from array of strings to array of objects
        if (req.body.images !== undefined) {
            updateData.images = Array.isArray(req.body.images) ? req.body.images.filter(img => {
                if (typeof img === 'string') {
                    return img && img.trim() !== '';
                } else if (img && typeof img === 'object' && img.url) {
                    return img.url && img.url.trim() !== '';
                }
                return false;
            }).map((img, index) => {
                if (typeof img === 'string') {
                    return {
                        url: img.trim(),
                        alt: req.body.name || product.name || 'Product image',
                        isPrimary: index === 0
                    };
                }
                return img; // Already an object
            }) : [];
        }
        
        // Map colors from array of strings to array of objects
        if (req.body.colors !== undefined) {
            updateData.colors = Array.isArray(req.body.colors) ? req.body.colors.map(color => {
                if (typeof color === 'string') {
                    return {
                        name: color,
                        inStock: true
                    };
                }
                return color; // Already an object
            }) : [];
        }
        
        // Map weight and dimensions
        if (req.body.weight !== undefined) {
            updateData.weight = req.body.weight ? {
                value: parseFloat(req.body.weight.value || req.body.weight),
                unit: req.body.weight.unit || 'g'
            } : undefined;
        }
        
        if (req.body.dimensions !== undefined) {
            updateData.dimensions = req.body.dimensions ? {
                length: req.body.dimensions.length ? parseFloat(req.body.dimensions.length) : 0,
                width: req.body.dimensions.width ? parseFloat(req.body.dimensions.width) : 0,
                height: req.body.dimensions.height ? parseFloat(req.body.dimensions.height) : 0,
                unit: req.body.dimensions.unit || 'cm'
            } : undefined;
        }
        
        // Map status flags
        if (req.body.isFeatured !== undefined) updateData.featured = req.body.isFeatured;
        if (req.body.isNewProduct !== undefined) updateData.newArrival = req.body.isNewProduct;
        if (req.body.isBestSeller !== undefined) updateData.bestSeller = req.body.isBestSeller;
        
        // Other fields
        if (req.body.status !== undefined) updateData.status = req.body.status;
        if (req.body.metaTitle !== undefined) updateData.metaTitle = req.body.metaTitle;
        if (req.body.metaDescription !== undefined) updateData.metaDescription = req.body.metaDescription;
        if (req.body.tags !== undefined) updateData.tags = req.body.tags;
        
        console.log('Mapped update data:', JSON.stringify(updateData, null, 2));
        
        // Update product
        try {
            product = await Product.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true
            });
            
            console.log('Product updated successfully:', product._id);
            
        } catch (updateError) {
            console.error('Update error:', updateError);
            
            // Handle specific validation errors
            if (updateError.name === 'ValidationError') {
                const validationErrors = Object.values(updateError.errors).map((err) => err.message);
                console.error('Validation errors:', validationErrors);
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            // Handle duplicate key errors
            if (updateError.code === 11000) {
                const field = Object.keys(updateError.keyPattern)[0];
                return res.status(400).json({
                    success: false,
                    message: `Product with this ${field} already exists`
                });
            }

            throw updateError;
        }
        
        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Error in updateProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if product exists
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Delete product
        await Product.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get product categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ displayOrder: 1 });
        
        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        console.error('Error in getCategories:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Find category by slug
        const category = await Category.findOne({ slug, isActive: true });
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Get products in this category
        const products = await Product.find({ 
            status: 'active',
            $or: [
                { category: category._id },
                { category: category._id.toString() },
                { category: category.slug },
                { category: category.name }
            ]
        })
        .select('name slug price originalPrice images averageRating reviewCount shortDescription subcategory category')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();
        
        // Manually populate category field for products
        for (let product of products) {
            if (product.category && typeof product.category === 'string') {
                // If category is a string, try to find the category by slug or name
                const categoryObj = await Category.findOne({
                    $or: [
                        { slug: product.category },
                        { name: product.category },
                        { _id: product.category }
                    ]
                });
                if (categoryObj) {
                    product.category = {
                        _id: categoryObj._id,
                        name: categoryObj.name,
                        slug: categoryObj.slug
                    };
                }
            }
        }
        
        // Get total count for pagination
        const totalProducts = await Product.countDocuments({ 
            status: 'active',
            $or: [
                { category: category._id },
                { category: category._id.toString() },
                { category: category.slug },
                { category: category.name }
            ]
        });
        
        // Calculate total pages
        const totalPages = Math.ceil(totalProducts / limit);
        
        res.status(200).json({
            success: true,
            category,
            count: products.length,
            totalProducts,
            totalPages,
            currentPage: page,
            products
        });
    } catch (error) {
        console.error('Error in getProductsByCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get bundles
exports.getBundles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter object - bundles use isActive instead of status
        const filter = { isActive: true };
        
        // Category filter
        if (req.query.category) {
            const category = await Category.findOne({ slug: req.query.category });
            if (category) {
                // Bundle category is stored as string, so match by slug, name, or singular form
                const categoryMatches = [category.slug, category.name, category._id.toString()];
                
                // Handle singular/plural forms and common mismatches
                if (req.query.category === 'flavors') {
                    categoryMatches.push('flavor');
                } else if (req.query.category === 'flavor') {
                    categoryMatches.push('flavors');
                } else if (req.query.category === 'sodamakers') {
                    categoryMatches.push('soda-makers', 'sodamaker');
                } else if (req.query.category === 'accessories') {
                    categoryMatches.push('accessory');
                }
                
                filter.category = {
                    $in: categoryMatches
                };
            }
        }
        
        // Featured bundles filter
        if (req.query.featured === 'true') {
            filter.isFeatured = true;
        }
        
        // Execute query with pagination
        const bundles = await Bundle.find(filter)
            .select('name slug price originalPrice images averageRating reviewCount isFeatured badge category')
            .populate('category', 'name slug')
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
            
        // Get total count for pagination
        const totalBundles = await Bundle.countDocuments(filter);
        
        // Calculate total pages
        const totalPages = Math.ceil(totalBundles / limit);
        
        res.status(200).json({
            success: true,
            count: bundles.length,
            totalBundles,
            totalPages,
            currentPage: page,
            bundles
        });
    } catch (error) {
        console.error('Error in getBundles:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get a single bundle by ID or slug
exports.getBundle = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        
        // Check if the parameter is an ObjectId or a slug
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
        
        let bundle;
        if (isObjectId) {
            bundle = await Bundle.findById(idOrSlug);
        } else {
            bundle = await Bundle.findOne({ slug: idOrSlug });
        }
        
        if (!bundle) {
            return res.status(404).json({
                success: false,
                message: 'Bundle not found'
            });
        }
        
        // Populate category and product items
        await bundle.populate('category', 'name slug');
        await bundle.populate('items.product', 'name images price stock');
        
        // Get reviews for this bundle
        const reviews = await Review.find({ 
            bundle: bundle._id,
            status: 'approved'
        })
        .populate('user', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(5);
        
        res.status(200).json({
            success: true,
            bundle,
            reviews
        });
    } catch (error) {
        console.error('Error in getBundle:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Create a new bundle
exports.createBundle = async (req, res) => {
    try {
        const bundleData = req.body;
        
        console.log('Creating bundle with data:', bundleData);
        
        // Validate required fields
        if (!bundleData.name || !bundleData.description || !bundleData.price) {
            return res.status(400).json({
                success: false,
                message: 'Name, description, and price are required'
            });
        }

        // Generate unique slug from name
        let baseSlug = bundleData.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        
        // Check for existing slug and make it unique if needed
        let slug = baseSlug;
        let counter = 1;
        
        while (await Bundle.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        
        bundleData.slug = slug;

        // Ensure numeric fields are properly converted
        if (bundleData.price) bundleData.price = parseFloat(bundleData.price);
        if (bundleData.originalPrice) bundleData.originalPrice = parseFloat(bundleData.originalPrice);
        if (bundleData.bundleDiscount) bundleData.bundleDiscount = parseFloat(bundleData.bundleDiscount);
        if (bundleData.stock) bundleData.stock = parseInt(bundleData.stock);

        console.log('Processed bundle data:', bundleData);

        // Create new bundle
        const bundle = new Bundle(bundleData);
        await bundle.save();

        console.log('Bundle saved successfully:', bundle);

        res.status(201).json({
            success: true,
            message: 'Bundle created successfully',
            bundle
        });
    } catch (error) {
        console.error('Error in createBundle:', error);
        
        // Handle duplicate key error specifically
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A bundle with this name already exists. Please choose a different name.',
                error: 'Duplicate bundle name'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create bundle',
            error: error.message
        });
    }
};

// Update an existing bundle
exports.updateBundle = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('Updating bundle:', id, 'with data:', updateData);

        // Check if bundle exists
        const bundle = await Bundle.findById(id);
        if (!bundle) {
            return res.status(404).json({
                success: false,
                message: 'Bundle not found'
            });
        }

        // Ensure numeric fields are properly converted
        if (updateData.price) updateData.price = parseFloat(updateData.price);
        if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
        if (updateData.bundleDiscount) updateData.bundleDiscount = parseFloat(updateData.bundleDiscount);
        if (updateData.stock) updateData.stock = parseInt(updateData.stock);

        // Update bundle
        Object.assign(bundle, updateData);
        await bundle.save();

        console.log('Bundle updated successfully:', bundle);

        res.status(200).json({
            success: true,
            message: 'Bundle updated successfully',
            bundle
        });
    } catch (error) {
        console.error('Error in updateBundle:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update bundle',
            error: error.message
        });
    }
};

// Delete a bundle
exports.deleteBundle = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if bundle exists
        const bundle = await Bundle.findById(id);
        if (!bundle) {
            return res.status(404).json({
                success: false,
                message: 'Bundle not found'
            });
        }

        // Delete bundle
        await Bundle.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Bundle deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteBundle:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete bundle',
            error: error.message
        });
    }
};

// Review management functions
exports.getProductReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ 
            product: id,
            status: 'approved'
        })
        .populate('user', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const totalReviews = await Review.countDocuments({ 
            product: id,
            status: 'approved'
        });

        res.status(200).json({
            success: true,
            reviews,
            totalReviews,
            currentPage: page,
            totalPages: Math.ceil(totalReviews / limit)
        });
    } catch (error) {
        console.error('Error in getProductReviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};

exports.getBundleReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ 
            bundle: id,
            status: 'approved'
        })
        .populate('user', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const totalReviews = await Review.countDocuments({ 
            bundle: id,
            status: 'approved'
        });

        res.status(200).json({
            success: true,
            reviews,
            totalReviews,
            currentPage: page,
            totalPages: Math.ceil(totalReviews / limit)
        });
    } catch (error) {
        console.error('Error in getBundleReviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};

exports.createReview = async (req, res) => {
    try {
        const { product, bundle, rating, title, comment, images } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Valid rating (1-5) is required'
            });
        }

        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Review comment is required'
            });
        }

        if (!product && !bundle) {
            return res.status(400).json({
                success: false,
                message: 'Either product or bundle ID is required'
            });
        }

        // Check if user already reviewed this product/bundle
        console.log('Checking for existing review:', { userId, product, bundle });
        
        const existingReview = await Review.findOne({
            user: userId,
            $or: [
                { product: product || null },
                { bundle: bundle || null }
            ]
        });

        if (existingReview) {
            console.log('Found existing review:', existingReview._id);
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this item. You can only review each product/bundle once.'
            });
        }

        console.log('No existing review found, proceeding to create new review');

        // Create new review - no purchase verification required
        const reviewData = {
            user: userId,
            rating,
            comment: comment.trim(),
            status: 'pending', // Reviews still need admin approval for quality control
            isVerifiedPurchase: false // Mark as not verified since no purchase check
        };

        if (product) reviewData.product = product;
        if (bundle) reviewData.bundle = bundle;
        if (title) reviewData.title = title.trim();
        if (images && images.length > 0) reviewData.images = images;

        const review = new Review(reviewData);
        await review.save();

        // Populate user info for response
        await review.populate('user', 'username avatar');

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully and pending approval',
            review
        });
    } catch (error) {
        console.error('Error in createReview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create review',
            error: error.message
        });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const userId = req.user._id;

        // Find review and check ownership
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own reviews'
            });
        }

        // Only allow updating certain fields
        const allowedUpdates = ['rating', 'title', 'comment', 'images'];
        const updates = {};
        
        allowedUpdates.forEach(field => {
            if (updateData[field] !== undefined) {
                updates[field] = updateData[field];
            }
        });

        // Reset status to pending for admin approval
        updates.status = 'pending';

        const updatedReview = await Review.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('user', 'username avatar');

        res.status(200).json({
            success: true,
            message: 'Review updated successfully and pending approval',
            review: updatedReview
        });
    } catch (error) {
        console.error('Error in updateReview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update review',
            error: error.message
        });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Find review and check ownership
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own reviews'
            });
        }

        await Review.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteReview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete review',
            error: error.message
        });
    }
};

// Admin review management functions
exports.getAllReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({})
            .populate('user', 'username avatar')
            .populate('product', 'name')
            .populate('bundle', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalReviews = await Review.countDocuments({});

        res.status(200).json({
            success: true,
            reviews,
            totalReviews,
            currentPage: page,
            totalPages: Math.ceil(totalReviews / limit)
        });
    } catch (error) {
        console.error('Error in getAllReviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};

exports.updateReviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be pending, approved, or rejected'
            });
        }

        const review = await Review.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).populate('user', 'username avatar')
         .populate('product', 'name')
         .populate('bundle', 'name');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // If status is approved, update product/bundle rating
        if (status === 'approved') {
            if (review.product) {
                await review.updateProductRating();
            } else if (review.bundle) {
                await review.updateBundleRating();
            }
        }

        res.status(200).json({
            success: true,
            message: `Review ${status} successfully`,
            review
        });
    } catch (error) {
        console.error('Error in updateReviewStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update review status',
            error: error.message
        });
    }
};
