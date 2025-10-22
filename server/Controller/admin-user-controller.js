const { createErrorResponse, logError } = require('../Utils/error-handler');
const User = require('../Models/user-model');
const bcrypt = require('bcryptjs');

// Admin User Management Controller
class AdminUserController {
  // Get all users with pagination and filtering
  getAllUsers = async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        role = '', 
        status = '',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter = {};
      
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } }
        ];
      }

      if (role === 'admin') {
        filter.isAdmin = true;
      } else if (role === 'user') {
        filter.isAdmin = { $ne: true };
      }

      if (status === 'active') {
        filter.status = 'active';
      } else if (status === 'inactive') {
        filter.status = 'inactive';
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get users with pagination
      const users = await User.find(filter)
        .select('-password -refreshToken')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const totalUsers = await User.countDocuments(filter);
      const totalPages = Math.ceil(totalUsers / parseInt(limit));

      res.json({
        success: true,
        users: users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: totalPages,
          totalUsers: totalUsers,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      });
    } catch (error) {
      logError(error, 'getAllUsers');
      res.status(500).json(createErrorResponse(
        'Failed to get users',
        error.message
      ));
    }
  };

  // Get user by ID
  getUserById = async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id).select('-password -refreshToken');
      
      if (!user) {
        return res.status(404).json(createErrorResponse(
          'User not found',
          'User with the specified ID does not exist'
        ));
      }

      res.json({
        success: true,
        user: user
      });
    } catch (error) {
      logError(error, 'getUserById');
      res.status(500).json(createErrorResponse(
        'Failed to get user',
        error.message
      ));
    }
  };

  // Update user
  updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove sensitive fields that shouldn't be updated directly
      delete updates.password;
      delete updates.refreshToken;
      delete updates._id;
      delete updates.createdAt;

      const user = await User.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password -refreshToken');

      if (!user) {
        return res.status(404).json(createErrorResponse(
          'User not found',
          'User with the specified ID does not exist'
        ));
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        user: user
      });
    } catch (error) {
      logError(error, 'updateUser');
      res.status(500).json(createErrorResponse(
        'Failed to update user',
        error.message
      ));
    }
  };

  // Delete user
  deleteUser = async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent deleting the last admin user
      const adminCount = await User.countDocuments({ isAdmin: true });
      const user = await User.findById(id);

      if (user && user.isAdmin && adminCount <= 1) {
        return res.status(400).json(createErrorResponse(
          'Cannot delete last admin',
          'At least one admin user must remain in the system'
        ));
      }

      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        return res.status(404).json(createErrorResponse(
          'User not found',
          'User with the specified ID does not exist'
        ));
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      logError(error, 'deleteUser');
      res.status(500).json(createErrorResponse(
        'Failed to delete user',
        error.message
      ));
    }
  };

  // Create admin user
  createAdminUser = async (req, res) => {
    try {
      const { 
        firstName, 
        lastName, 
        email, 
        username, 
        password,
        phone 
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !username || !password) {
        return res.status(400).json(createErrorResponse(
          'Missing required fields',
          'First name, last name, email, username, and password are required'
        ));
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: email }, { username: username }]
      });

      if (existingUser) {
        return res.status(400).json(createErrorResponse(
          'User already exists',
          'A user with this email or username already exists'
        ));
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create admin user
      const adminUser = new User({
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        phone: phone || '',
        isAdmin: true,
        status: 'active'
      });

      await adminUser.save();

      // Remove password from response
      const userResponse = adminUser.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        user: userResponse
      });
    } catch (error) {
      logError(error, 'createAdminUser');
      res.status(500).json(createErrorResponse(
        'Failed to create admin user',
        error.message
      ));
    }
  };

  // Update user role
  updateUserRole = async (req, res) => {
    try {
      const { id } = req.params;
      const { isAdmin } = req.body;

      // Prevent removing the last admin
      if (isAdmin === false) {
        const adminCount = await User.countDocuments({ isAdmin: true });
        const user = await User.findById(id);

        if (user && user.isAdmin && adminCount <= 1) {
          return res.status(400).json(createErrorResponse(
            'Cannot remove last admin',
            'At least one admin user must remain in the system'
          ));
        }
      }

      const user = await User.findByIdAndUpdate(
        id,
        { isAdmin: isAdmin },
        { new: true, runValidators: true }
      ).select('-password -refreshToken');

      if (!user) {
        return res.status(404).json(createErrorResponse(
          'User not found',
          'User with the specified ID does not exist'
        ));
      }

      res.json({
        success: true,
        message: `User role updated to ${isAdmin ? 'admin' : 'user'}`,
        user: user
      });
    } catch (error) {
      logError(error, 'updateUserRole');
      res.status(500).json(createErrorResponse(
        'Failed to update user role',
        error.message
      ));
    }
  };

  // Get user statistics
  getUserStats = async (req, res) => {
    try {
      const stats = {
        totalUsers: await User.countDocuments(),
        adminUsers: await User.countDocuments({ isAdmin: true }),
        regularUsers: await User.countDocuments({ isAdmin: { $ne: true } }),
        activeUsers: await User.countDocuments({ status: 'active' }),
        inactiveUsers: await User.countDocuments({ status: 'inactive' }),
        newUsersToday: await User.countDocuments({
          createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }),
        newUsersThisWeek: await User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }),
        newUsersThisMonth: await User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        })
      };

      res.json({
        success: true,
        stats: stats
      });
    } catch (error) {
      logError(error, 'getUserStats');
      res.status(500).json(createErrorResponse(
        'Failed to get user statistics',
        error.message
      ));
    }
  };

  // Reset user password
  resetUserPassword = async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json(createErrorResponse(
          'Invalid password',
          'Password must be at least 8 characters long'
        ));
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const user = await User.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true }
      );

      if (!user) {
        return res.status(404).json(createErrorResponse(
          'User not found',
          'User with the specified ID does not exist'
        ));
      }

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      logError(error, 'resetUserPassword');
      res.status(500).json(createErrorResponse(
        'Failed to reset password',
        error.message
      ));
    }
  };
}

module.exports = new AdminUserController();

