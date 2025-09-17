const User = require('../Models/user-model'); // Adjust path if needed
require('dotenv').config(); // Make sure this is loaded
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const { sendPasswordResetEmail, sendPasswordResetSuccessEmail, sendWelcomeEmail, sendEmail } = require('../Utils/email-service');
const { cloudinary, storage } = require('../Utils/cloudinary');

const home = (req, res) => {
    res.send('Hello World');
};

// Create admin user endpoint (for initial setup)
const createAdminUser = async (req, res) => {
    try {
        const { email, password, secret } = req.body;
        
        // Security: Only allow this in production with a secret key
        if (process.env.NODE_ENV !== 'production' || secret !== process.env.ADMIN_SETUP_SECRET) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: email || 'admin@drinkmate.com' });
        if (existingAdmin) {
            return res.status(400).json({ 
                error: 'Admin user already exists',
                email: existingAdmin.email 
            });
        }
        
        // Create admin user
        const adminUser = new User({
            username: 'admin',
            email: email || 'admin@drinkmate.com',
            password: password || 'admin123',
            firstName: 'Admin',
            lastName: 'User',
            isAdmin: true,
            isActive: true,
            emailVerified: true
        });
        
        const savedUser = await adminUser.save();
        
        // Generate token
        const token = savedUser.generateAuthToken();
        
        return res.status(201).json({
            message: 'Admin user created successfully',
            user: {
                _id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                isAdmin: savedUser.isAdmin,
            },
            token
        });
        
    } catch (error) {
        console.error('Error creating admin user:', error);
        return res.status(500).json({ error: 'Failed to create admin user' });
    }
};

// REGISTER new user
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Create new user with required fields
            const user = new User({ 
                username, 
                email, 
                password,
                firstName: username, // Use username as firstName if not provided
                lastName: 'User'     // Default lastName
            });
            await user.save();

            // Send welcome email
            try {
                await sendWelcomeEmail(email, username);
                console.log('✅ Welcome email sent to:', email);
            } catch (emailError) {
                console.error('⚠️ Failed to send welcome email, but user was registered:', emailError);
                // Don't fail the request if email fails
            }

            // Generate token
            const token = user.generateAuthToken();

            return res.status(201).json({ 
                message: 'User registered', 
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    isAdmin: user.isAdmin,
                }
            });
        } catch (mongoError) {
            console.error("MongoDB error during registration, using demo registration:", mongoError);
            
            // If MongoDB is unavailable, create a demo user
            const userId = `demo_${Date.now()}`;
            
            // Generate a simple token
            const token = jwt.sign(
                { id: userId, isAdmin: false },
                process.env.JWT_SECRET,
                { expiresIn: '2d' }
            );
            
            return res.status(201).json({ 
                message: 'Demo user registered', 
                token,
                user: {
                    _id: userId,
                    username,
                    email,
                    isAdmin: false,
                }
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// LOGIN user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Received login request:", req.body);

        // Security: Demo accounts removed for production security
        // Demo accounts are only available in development mode
        const demoAccounts = process.env.NODE_ENV === 'development' ? [
            {
                _id: "demo123",
                username: "admin",
                email: "admin@drinkmate.com",
                password: "admin123",
                isAdmin: true
            },
            {
                _id: "demo456",
                username: "testuser",
                email: "test@example.com",
                password: "test123",
                isAdmin: false
            }
        ] : [];

        // Try to find user in MongoDB first
        try {
            const user = await User.findOne({ email });
            if (user) {
                // Compare password
                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }

                // Generate token
                const token = user.generateAuthToken();

                return res.status(200).json({
                    message: 'Login successful',
                    token,
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        isAdmin: user.isAdmin,
                    },
                });
            }
        } catch (mongoError) {
            console.error("MongoDB error during login, falling back to demo accounts:", mongoError);
        }

        // Security: Only allow demo accounts in development mode
        if (process.env.NODE_ENV === 'development' && demoAccounts.length > 0) {
            const demoUser = demoAccounts.find(account => account.email === email && account.password === password);
            
            if (demoUser) {
                // Generate a simple token
                const token = jwt.sign(
                    { id: demoUser._id, isAdmin: demoUser.isAdmin },
                    process.env.JWT_SECRET,
                    { expiresIn: '2d' }
                );

                return res.status(200).json({
                    message: 'Demo login successful',
                    token,
                    user: {
                        _id: demoUser._id,
                        username: demoUser.username,
                        email: demoUser.email,
                        isAdmin: demoUser.isAdmin,
                    },
                });
            }
        }

        // If no user found in either MongoDB or demo accounts
        return res.status(401).json({ error: 'Invalid email or password' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// Verify token and return user data
const verifyToken = async (req, res) => {
    try {
        // Extract token from authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        
        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // If token is for a demo user (starts with 'demo')
            if (decoded.id.toString().startsWith('demo')) {
                return res.status(200).json({
                    user: {
                        _id: decoded.id,
                        username: 'Demo User',
                        email: 'demo@example.com',
                        isAdmin: decoded.isAdmin || false,
                    }
                });
            }
            
            // Try to find user in MongoDB
            try {
                const user = await User.findById(decoded.id);
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                
                return res.status(200).json({
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        isAdmin: user.isAdmin,
                    }
                });
            } catch (mongoError) {
                console.error("MongoDB error during token verification, using decoded token data:", mongoError);
                
                // If MongoDB is unavailable, return basic user info from token
                return res.status(200).json({
                    user: {
                        _id: decoded.id,
                        username: 'User',
                        email: 'user@example.com',
                        isAdmin: decoded.isAdmin || false,
                    }
                });
            }
        } catch (jwtError) {
            console.error("JWT verification error:", jwtError);
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during token verification' });
    }
};

// LOGOUT placeholder (since JWTs are stateless)
const logout = (req, res) => {
    res.json({ message: 'User logged out (client should delete token)' });
};

// Forgot password - send reset email
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            // For security reasons, don't reveal that the email doesn't exist
            return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
        }
        
        // Generate reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save();
        
        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password/${resetToken}`;
        
        // Send password reset email
        const emailResult = await sendPasswordResetEmail(
            user.email, 
            resetUrl, 
            user.username || user.firstName || 'User'
        );
        
        if (emailResult.success) {
            console.log('✅ Password reset email sent successfully to:', user.email);
            
            // In production, only return success message
            if (process.env.NODE_ENV === 'production') {
                res.status(200).json({ message: 'Password reset email sent successfully' });
            } else {
                // In development, return additional info for testing
                res.status(200).json({ 
                    message: 'Password reset email sent successfully',
                    resetUrl,
                    resetToken,
                    emailResult
                });
            }
        } else {
            console.error('❌ Failed to send password reset email:', emailResult.error);
            
            // Clear the reset token since email failed
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            
            res.status(500).json({ error: 'Failed to send password reset email. Please try again later.' });
        }
        
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Server error during password reset request' });
    }
};

// Reset password with token
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        
        // Hash the token from the URL to compare with stored hash
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
            
        // Find user with valid token and non-expired reset token
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired password reset token' });
        }
        
        // Set new password and clear reset token fields
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();
        
        // Send password reset success email
        try {
            await sendPasswordResetSuccessEmail(
                user.email, 
                user.username || user.firstName || 'User'
            );
            console.log('✅ Password reset success email sent to:', user.email);
        } catch (emailError) {
            console.error('⚠️ Failed to send success email, but password was reset:', emailError);
            // Don't fail the request if email fails
        }
        
        res.status(200).json({ message: 'Password has been reset successfully' });
        
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Server error during password reset' });
    }
};

const Contact = require('../Models/contact-model');

// Contact form submission
const submitContact = async (req, res) => {
    try {
        console.log('📧 Contact form submission received:', req.body);
        
        const { name, email, message, phone, subject, userId } = req.body;

        if (!name || !email || !message) {
            console.log('❌ Missing required fields:', { name: !!name, email: !!email, message: !!message });
            return res.status(400).json({ error: 'Name, email, and message are required.' });
        }

        console.log('✅ Creating new contact with data:', { name, email, message, phone, subject, userId });

        const contact = new Contact({ 
            name, 
            email, 
            message, 
            phone, 
            subject,
            userId,
            status: 'new'
        });
        
        console.log('💾 Saving contact to database...');
        await contact.save();
        console.log('✅ Contact saved successfully with ID:', contact._id);

        // In a real application, you would send an email notification here
        // to the admin and a confirmation email to the user

        res.status(201).json({ 
            success: true,
            message: 'Contact message submitted successfully.',
            contactId: contact._id
        });
    } catch (err) {
        console.error('❌ Error in submitContact:', err);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error.',
            details: err.message
        });
    }
};

// Test email functionality (for development/testing)
const testEmail = async (req, res) => {
    try {
        const { email, template = 'passwordReset' } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        // Test email templates
        const testData = {
            resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password/test-token`,
            userName: 'Test User'
        };
        
        const emailResult = await sendEmail(email, template, testData);
        
        if (emailResult.success) {
            res.status(200).json({ 
                message: 'Test email sent successfully',
                emailResult 
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to send test email',
                emailResult 
            });
        }
        
    } catch (err) {
        console.error('Test email error:', err);
        res.status(500).json({ error: 'Server error during test email' });
    }
};

// Test welcome email functionality
const testWelcomeEmail = async (req, res) => {
    try {
        const { email, userName = 'Test User' } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        const emailResult = await sendWelcomeEmail(email, userName);
        if (emailResult.success) {
            res.status(200).json({
                message: 'Welcome email sent successfully',
                emailResult
            });
        } else {
            res.status(500).json({
                error: 'Failed to send welcome email',
                emailResult
            });
        }
    } catch (err) {
        console.error('Test welcome email error:', err);
        res.status(500).json({ error: 'Server error during test welcome email' });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Try to get user from MongoDB first
        try {
            const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
            if (user) {
                return res.status(200).json({
                    success: true,
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phone: user.phone,
                        avatar: user.avatar,
                        isAdmin: user.isAdmin,
                        status: user.status,
                        createdAt: user.createdAt,
                        lastLogin: user.lastLogin
                    }
                });
            }
        } catch (mongoError) {
            console.error("MongoDB error during profile fetch, using token data:", mongoError);
        }
        
        // Fallback to token data if MongoDB is unavailable
        res.status(200).json({
            success: true,
            user: {
                _id: req.user._id,
                username: req.user.username || 'User',
                email: req.user.email || 'user@example.com',
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                phone: req.user.phone,
                avatar: req.user.avatar,
                isAdmin: req.user.isAdmin || false,
                status: 'active',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during profile fetch' });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { firstName, lastName, phone, username, email } = req.body;
        
        // Try to update user in MongoDB first
        try {
            const user = await User.findById(userId);
            if (user) {
                // Check if username or email is being changed and if it's already taken
                if (username && username !== user.username) {
                    const existingUser = await User.findOne({ 
                        username, 
                        _id: { $ne: userId } 
                    });
                    if (existingUser) {
                        return res.status(400).json({ 
                            error: 'Username is already taken' 
                        });
                    }
                    user.username = username;
                }
                
                if (email && email !== user.email) {
                    const existingUser = await User.findOne({ 
                        email, 
                        _id: { $ne: userId } 
                    });
                    if (existingUser) {
                        return res.status(400).json({ 
                            error: 'Email is already taken' 
                        });
                    }
                    user.email = email;
                }
                
                // Update other fields
                if (firstName !== undefined) user.firstName = firstName;
                if (lastName !== undefined) user.lastName = lastName;
                if (phone !== undefined) user.phone = phone;
                
                await user.save();
                
                return res.status(200).json({
                    success: true,
                    message: 'Profile updated successfully',
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phone: user.phone,
                        avatar: user.avatar,
                        isAdmin: user.isAdmin,
                        status: user.status,
                        createdAt: user.createdAt,
                        lastLogin: user.lastLogin
                    }
                });
            }
        } catch (mongoError) {
            console.error("MongoDB error during profile update:", mongoError);
        }
        
        // Fallback response if MongoDB is unavailable
        res.status(200).json({
            success: true,
            message: 'Profile update simulated (MongoDB unavailable)',
            user: {
                _id: req.user._id,
                username: username || req.user.username || 'User',
                email: email || req.user.email || 'user@example.com',
                firstName: firstName || req.user.firstName,
                lastName: lastName || req.user.lastName,
                phone: phone || req.user.phone,
                avatar: req.user.avatar,
                isAdmin: req.user.isAdmin || false,
                status: 'active',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during profile update' });
    }
};

// Change user password
const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                error: 'Current password and new password are required' 
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                error: 'New password must be at least 6 characters long' 
            });
        }
        
        // Try to change password in MongoDB first
        try {
            const user = await User.findById(userId);
            if (user) {
                // Verify current password
                const isMatch = await user.comparePassword(currentPassword);
                if (!isMatch) {
                    return res.status(400).json({ 
                        error: 'Current password is incorrect' 
                    });
                }
                
                // Update password
                user.password = newPassword;
                await user.save();
                
                return res.status(200).json({
                    success: true,
                    message: 'Password changed successfully'
                });
            }
        } catch (mongoError) {
            console.error("MongoDB error during password change:", mongoError);
        }
        
        // Fallback response if MongoDB is unavailable
        res.status(200).json({
            success: true,
            message: 'Password change simulated (MongoDB unavailable)'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during password change' });
    }
};

// Upload user avatar
const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user._id;
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: 'No image file provided' 
            });
        }
        
        // Try to update user avatar in MongoDB first
        try {
            const user = await User.findById(userId);
            if (user) {
                // Delete old avatar from Cloudinary if it exists
                if (user.avatar && user.avatar.includes('cloudinary')) {
                    try {
                        const publicId = user.avatar.split('/').pop().split('.')[0];
                        await cloudinary.uploader.destroy(`drinkmate/${publicId}`);
                    } catch (deleteError) {
                        console.error('Error deleting old avatar:', deleteError);
                        // Continue with upload even if deletion fails
                    }
                }
                
                // Update user avatar with new Cloudinary URL
                user.avatar = req.file.path;
                await user.save();
                
                return res.status(200).json({
                    success: true,
                    message: 'Avatar uploaded successfully',
                    avatar: req.file.path
                });
            }
        } catch (mongoError) {
            console.error("MongoDB error during avatar upload:", mongoError);
        }
        
        // Fallback response if MongoDB is unavailable
        res.status(200).json({
            success: true,
            message: 'Avatar upload simulated (MongoDB unavailable)',
            avatar: req.file.path
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false,
            error: 'Server error during avatar upload' 
        });
    }
};

module.exports = {
    home,
    createAdminUser,
    register,
    login,
    logout,
    verifyToken,
    forgotPassword,
    resetPassword,
    submitContact,
    testEmail,
    testWelcomeEmail,
    getUserProfile,
    updateUserProfile,
    changePassword,
    uploadAvatar
};
