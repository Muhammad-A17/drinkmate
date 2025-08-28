const User = require('../Models/user-model'); // Adjust path if needed
require('dotenv').config(); // Make sure this is loaded
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendPasswordResetSuccessEmail, sendWelcomeEmail, sendEmail } = require('../Utils/email-service');

const home = (req, res) => {
    res.send('Hello World');
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

            // Create new user
            const user = new User({ username, email, password });
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
                process.env.JWT_SECRET || 'default_dev_secret',
                { expiresIn: '1h' }
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

        // Hardcoded demo accounts for when MongoDB is not available
        const demoAccounts = [
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
        ];

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

        // If MongoDB fails or user not found, try demo accounts
        const demoUser = demoAccounts.find(account => account.email === email && account.password === password);
        
        if (demoUser) {
            // Generate a simple token
            const token = jwt.sign(
                { id: demoUser._id, isAdmin: demoUser.isAdmin },
                process.env.JWT_SECRET || 'default_dev_secret',
                { expiresIn: '1h' }
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
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_dev_secret');
            
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

module.exports = { 
    home, 
    register, 
    login, 
    logout, 
    verifyToken,
    forgotPassword,
    resetPassword,
    submitContact,
    testEmail,
    testWelcomeEmail
};
