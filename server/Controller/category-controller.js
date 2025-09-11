const Category = require('../Models/category-model');
const Subcategory = require('../Models/subcategory-model');
const Product = require('../Models/product-model');
const Bundle = require('../Models/bundle-model');

// ==================== CATEGORY CONTROLLERS ====================

// Get all categories with subcategories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ sortOrder: 1, name: 1 });

        // Fetch subcategories separately to avoid circular dependency
        const categoriesWithSubs = await Promise.all(
            categories.map(async (category) => {
                const subcategories = await Subcategory.find({ 
                    category: category._id, 
                    isActive: true 
                }).sort({ sortOrder: 1, name: 1 });
                
                return {
                    ...category.toObject(),
                    subcategories
                };
            })
        );

        res.status(200).json({
            success: true,
            categories: categoriesWithSubs
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
};

// Get all categories for admin (including inactive)
exports.getAdminCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ sortOrder: 1, name: 1 });

        // Fetch subcategories separately to avoid circular dependency
        const categoriesWithSubs = await Promise.all(
            categories.map(async (category) => {
                const subcategories = await Subcategory.find({ 
                    category: category._id 
                }).sort({ sortOrder: 1, name: 1 });
                
                return {
                    ...category.toObject(),
                    subcategories
                };
            })
        );

        res.status(200).json({
            success: true,
            categories: categoriesWithSubs
        });
    } catch (error) {
        console.error('Error fetching admin categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
};

// Get single category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Fetch subcategories separately to avoid circular dependency
        const subcategories = await Subcategory.find({ 
            category: category._id 
        }).sort({ sortOrder: 1, name: 1 });

        const categoryWithSubs = {
            ...category.toObject(),
            subcategories
        };

        res.status(200).json({
            success: true,
            category: categoryWithSubs
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category'
        });
    }
};

// Create new category
exports.createCategory = async (req, res) => {
    try {
        const { name, description, image, icon, color, sortOrder, parentCategory } = req.body;

        // Check if category with same name already exists
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        // Generate slug from name
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const categoryData = {
            name: name.trim(),
            slug: slug,
            description: description?.trim() || '',
            image: image || '',
            icon: icon || '',
            color: color || '#12d6fa',
            sortOrder: sortOrder || 0,
            parentCategory: parentCategory || null
        };

        const category = new Category(categoryData);
        await category.save();

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create category'
        });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, image, icon, color, sortOrder, parentCategory, isActive } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if name change conflicts with existing category
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: id }
            });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this name already exists'
                });
            }
        }

        // Generate new slug if name changed
        let newSlug = category.slug;
        if (name && name !== category.name) {
            newSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        
        const updateData = {
            name: name?.trim() || category.name,
            slug: newSlug,
            description: description?.trim() || category.description,
            image: image !== undefined ? image : category.image,
            icon: icon !== undefined ? icon : category.icon,
            color: color || category.color,
            sortOrder: sortOrder !== undefined ? sortOrder : category.sortOrder,
            parentCategory: parentCategory !== undefined ? parentCategory : category.parentCategory,
            isActive: isActive !== undefined ? isActive : category.isActive
        };

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        // Fetch subcategories separately to avoid circular dependency
        const subcategories = await Subcategory.find({ 
            category: updatedCategory._id 
        }).sort({ sortOrder: 1, name: 1 });

        const categoryWithSubs = {
            ...updatedCategory.toObject(),
            subcategories
        };

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            category: categoryWithSubs
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update category'
        });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { force } = req.query; // Allow force deletion

        // Check if category has products or bundles
        const products = await Product.find({ category: id });
        const bundles = await Bundle.find({ category: id });
        
        if (products.length > 0 || bundles.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with existing products or bundles. Please reassign or delete them first.'
            });
        }

        // If force deletion is not requested, check for subcategories
        if (force !== 'true') {
            const subcategories = await Subcategory.find({ category: id });
            if (subcategories.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete category with existing subcategories. Please delete subcategories first or use force deletion.',
                    hasSubcategories: true,
                    subcategoryCount: subcategories.length
                });
            }
        }

        // If force deletion is requested, delete all subcategories first
        if (force === 'true') {
            const subcategories = await Subcategory.find({ category: id });
            for (const subcategory of subcategories) {
                // Check if subcategory has products or bundles
                const subProducts = await Product.find({ subcategory: subcategory._id });
                const subBundles = await Bundle.find({ subcategory: subcategory._id });
                
                if (subProducts.length > 0 || subBundles.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot delete category. Subcategory "${subcategory.name}" has existing products or bundles. Please reassign or delete them first.`
                    });
                }

                // Remove subcategory from category's subcategories array
                await Category.findByIdAndUpdate(id, {
                    $pull: { subcategories: subcategory._id }
                });

                // Delete the subcategory
                await Subcategory.findByIdAndDelete(subcategory._id);
            }
        }

        await Category.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete category'
        });
    }
};

// Toggle category status
exports.toggleCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        category.isActive = !category.isActive;
        await category.save();

        res.status(200).json({
            success: true,
            message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
            category
        });
    } catch (error) {
        console.error('Error toggling category status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle category status'
        });
    }
};

// ==================== SUBCATEGORY CONTROLLERS ====================

// Get all subcategories
exports.getAllSubcategories = async (req, res) => {
    try {
        const subcategories = await Subcategory.find({ isActive: true })
            .populate('category', 'name slug')
            .sort({ sortOrder: 1, name: 1 });

        res.status(200).json({
            success: true,
            subcategories
        });
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subcategories'
        });
    }
};

// Get all subcategories for admin (including inactive)
exports.getAdminSubcategories = async (req, res) => {
    try {
        const subcategories = await Subcategory.find()
            .populate('category', 'name slug')
            .sort({ sortOrder: 1, name: 1 });

        res.status(200).json({
            success: true,
            subcategories
        });
    } catch (error) {
        console.error('Error fetching admin subcategories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subcategories'
        });
    }
};

// Get subcategories by category
exports.getSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const subcategories = await Subcategory.find({ 
            category: categoryId, 
            isActive: true 
        }).sort({ sortOrder: 1, name: 1 });

        res.status(200).json({
            success: true,
            subcategories
        });
    } catch (error) {
        console.error('Error fetching subcategories by category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subcategories'
        });
    }
};

// Get single subcategory by ID
exports.getSubcategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const subcategory = await Subcategory.findById(id)
            .populate('category', 'name slug');

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        res.status(200).json({
            success: true,
            subcategory
        });
    } catch (error) {
        console.error('Error fetching subcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subcategory'
        });
    }
};

// Create new subcategory
exports.createSubcategory = async (req, res) => {
    try {
        const { name, description, image, icon, color, sortOrder, category } = req.body;

        // Validate category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: 'Parent category does not exist'
            });
        }

        // Check if subcategory with same name already exists in this category
        const existingSubcategory = await Subcategory.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            category: category
        });
        if (existingSubcategory) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory with this name already exists in this category'
            });
        }

        // Generate slug from name
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const subcategoryData = {
            name: name.trim(),
            slug: slug,
            description: description?.trim() || '',
            image: image || '',
            icon: icon || '',
            color: color || '#6b7280',
            sortOrder: sortOrder || 0,
            category: category
        };

        const subcategory = new Subcategory(subcategoryData);
        await subcategory.save();

        // Add subcategory to category's subcategories array
        await Category.findByIdAndUpdate(category, {
            $push: { subcategories: subcategory._id }
        });

        res.status(201).json({
            success: true,
            message: 'Subcategory created successfully',
            subcategory
        });
    } catch (error) {
        console.error('Error creating subcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create subcategory'
        });
    }
};

// Update subcategory
exports.updateSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, image, icon, color, sortOrder, category, isActive } = req.body;

        const subcategory = await Subcategory.findById(id);
        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        // If changing category, validate new category exists
        if (category && category !== subcategory.category.toString()) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Parent category does not exist'
                });
            }
        }

        // Check if name change conflicts with existing subcategory in the same category
        if (name && name !== subcategory.name) {
            const targetCategory = category || subcategory.category;
            const existingSubcategory = await Subcategory.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                category: targetCategory,
                _id: { $ne: id }
            });
            if (existingSubcategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Subcategory with this name already exists in this category'
                });
            }
        }

        // Generate new slug if name changed
        let newSlug = subcategory.slug;
        if (name && name !== subcategory.name) {
            newSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        
        const updateData = {
            name: name?.trim() || subcategory.name,
            slug: newSlug,
            description: description?.trim() || subcategory.description,
            image: image !== undefined ? image : subcategory.image,
            icon: icon !== undefined ? icon : subcategory.icon,
            color: color || subcategory.color,
            sortOrder: sortOrder !== undefined ? sortOrder : subcategory.sortOrder,
            category: category || subcategory.category,
            isActive: isActive !== undefined ? isActive : subcategory.isActive
        };

        const updatedSubcategory = await Subcategory.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('category', 'name slug');

        res.status(200).json({
            success: true,
            message: 'Subcategory updated successfully',
            subcategory: updatedSubcategory
        });
    } catch (error) {
        console.error('Error updating subcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update subcategory'
        });
    }
};

// Delete subcategory
exports.deleteSubcategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if subcategory has products or bundles
        const products = await Product.find({ subcategory: id });
        const bundles = await Bundle.find({ subcategory: id });
        
        if (products.length > 0 || bundles.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete subcategory with existing products or bundles. Please reassign or delete them first.'
            });
        }

        const subcategory = await Subcategory.findById(id);
        if (subcategory) {
            // Remove subcategory from category's subcategories array
            await Category.findByIdAndUpdate(subcategory.category, {
                $pull: { subcategories: id }
            });
        }

        await Subcategory.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Subcategory deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete subcategory'
        });
    }
};

// Toggle subcategory status
exports.toggleSubcategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const subcategory = await Subcategory.findById(id);

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        subcategory.isActive = !subcategory.isActive;
        await subcategory.save();

        res.status(200).json({
            success: true,
            message: `Subcategory ${subcategory.isActive ? 'activated' : 'deactivated'} successfully`,
            subcategory
        });
    } catch (error) {
        console.error('Error toggling subcategory status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle subcategory status'
        });
    }
};

// ==================== UTILITY FUNCTIONS ====================

// Update product and bundle counts for categories and subcategories
exports.updateItemCounts = async () => {
    try {
        // Update category counts
        const categories = await Category.find();
        for (const category of categories) {
            const productCount = await Product.countDocuments({ category: category._id });
            const bundleCount = await Bundle.countDocuments({ category: category._id });
            
            await Category.findByIdAndUpdate(category._id, {
                productCount,
                bundleCount
            });
        }

        // Update subcategory counts
        const subcategories = await Subcategory.find();
        for (const subcategory of subcategories) {
            const productCount = await Product.countDocuments({ subcategory: subcategory._id });
            const bundleCount = await Bundle.countDocuments({ subcategory: subcategory._id });
            
            await Subcategory.findByIdAndUpdate(subcategory._id, {
                productCount,
                bundleCount
            });
        }

        console.log('Item counts updated successfully');
    } catch (error) {
        console.error('Error updating item counts:', error);
    }
};
