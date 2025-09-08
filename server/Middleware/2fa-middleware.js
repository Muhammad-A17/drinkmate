const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

class TwoFactorAuth {
  constructor() {
    this.tempSecrets = new Map(); // Store temporary secrets during setup
    this.backupCodes = new Map(); // Store backup codes
  }

  // Generate a new 2FA secret for a user
  generateSecret(userId, username) {
    const secret = speakeasy.generateSecret({
      name: `DrinkMate (${username})`,
      issuer: 'DrinkMate',
      length: 32
    });

    // Store temporarily (expires in 10 minutes)
    this.tempSecrets.set(userId, {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url,
      expires: Date.now() + (10 * 60 * 1000)
    });

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url
    };
  }

  // Generate QR code for 2FA setup
  async generateQRCode(secretUrl) {
    try {
      return await QRCode.toDataURL(secretUrl);
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  // Verify 2FA token
  verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps (60 seconds) tolerance
    });
  }

  // Generate backup codes
  generateBackupCodes(userId) {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    
    // Store hashed backup codes
    const hashedCodes = codes.map(code => crypto.createHash('sha256').update(code).digest('hex'));
    this.backupCodes.set(userId, hashedCodes);
    
    return codes;
  }

  // Verify backup code
  verifyBackupCode(userId, code) {
    const hashedCodes = this.backupCodes.get(userId);
    if (!hashedCodes) return false;

    const hashedCode = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
    const index = hashedCodes.indexOf(hashedCode);
    
    if (index !== -1) {
      // Remove used backup code
      hashedCodes.splice(index, 1);
      this.backupCodes.set(userId, hashedCodes);
      return true;
    }
    
    return false;
  }

  // Clean up expired temporary secrets
  cleanup() {
    const now = Date.now();
    for (const [userId, data] of this.tempSecrets.entries()) {
      if (data.expires < now) {
        this.tempSecrets.delete(userId);
      }
    }
  }
}

const twoFactorAuth = new TwoFactorAuth();

// Cleanup expired secrets every 5 minutes
setInterval(() => {
  twoFactorAuth.cleanup();
}, 5 * 60 * 1000);

// 2FA setup middleware
const setup2FA = async (req, res) => {
  try {
    const { userId, username } = req.body;
    
    if (!userId || !username) {
      return res.status(400).json({
        error: 'User ID and username are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const secretData = twoFactorAuth.generateSecret(userId, username);
    const qrCode = await twoFactorAuth.generateQRCode(secretData.qrCodeUrl);
    const backupCodes = twoFactorAuth.generateBackupCodes(userId);

    res.json({
      success: true,
      secret: secretData.secret,
      qrCode,
      backupCodes,
      message: '2FA setup initiated. Scan QR code with authenticator app.'
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      error: 'Failed to setup 2FA',
      code: '2FA_SETUP_FAILED'
    });
  }
};

// 2FA verification middleware
const verify2FA = async (req, res, next) => {
  try {
    const { token, backupCode } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    // Check if user has 2FA enabled
    const User = require('../Models/User');
    const user = await User.findById(userId);
    
    if (!user.twoFactorEnabled) {
      return next(); // Skip 2FA if not enabled
    }

    let isValid = false;

    // Try backup code first if provided
    if (backupCode) {
      isValid = twoFactorAuth.verifyBackupCode(userId, backupCode);
      if (isValid) {
        console.log(`2FA backup code used for user ${userId}`);
      }
    } else if (token) {
      // Verify TOTP token
      isValid = twoFactorAuth.verifyToken(user.twoFactorSecret, token);
    }

    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid 2FA token or backup code',
        code: 'INVALID_2FA_TOKEN'
      });
    }

    // Update last 2FA verification
    user.last2FAVerification = new Date();
    await user.save();

    next();
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({
      error: '2FA verification failed',
      code: '2FA_VERIFICATION_FAILED'
    });
  }
};

// 2FA enable/disable middleware
const toggle2FA = async (req, res) => {
  try {
    const { userId, token, action } = req.body; // action: 'enable' or 'disable'
    
    if (!userId || !action) {
      return res.status(400).json({
        error: 'User ID and action are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const User = require('../Models/User');
    const user = await User.findById(userId);

    if (action === 'enable') {
      if (!token) {
        return res.status(400).json({
          error: 'Verification token is required to enable 2FA',
          code: 'MISSING_VERIFICATION_TOKEN'
        });
      }

      // Verify the token before enabling
      const tempSecret = twoFactorAuth.tempSecrets.get(userId);
      if (!tempSecret || tempSecret.expires < Date.now()) {
        return res.status(400).json({
          error: '2FA setup session expired. Please start setup again.',
          code: '2FA_SETUP_EXPIRED'
        });
      }

      const isValid = twoFactorAuth.verifyToken(tempSecret.secret, token);
      if (!isValid) {
        return res.status(401).json({
          error: 'Invalid verification token',
          code: 'INVALID_VERIFICATION_TOKEN'
        });
      }

      // Enable 2FA
      user.twoFactorEnabled = true;
      user.twoFactorSecret = tempSecret.secret;
      user.twoFactorEnabledAt = new Date();
      
      // Clean up temporary secret
      twoFactorAuth.tempSecrets.delete(userId);

      await user.save();

      res.json({
        success: true,
        message: '2FA enabled successfully'
      });
    } else if (action === 'disable') {
      // Disable 2FA
      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      user.twoFactorEnabledAt = undefined;
      
      // Clean up backup codes
      twoFactorAuth.backupCodes.delete(userId);

      await user.save();

      res.json({
        success: true,
        message: '2FA disabled successfully'
      });
    } else {
      res.status(400).json({
        error: 'Invalid action. Use "enable" or "disable"',
        code: 'INVALID_ACTION'
      });
    }
  } catch (error) {
    console.error('2FA toggle error:', error);
    res.status(500).json({
      error: 'Failed to toggle 2FA',
      code: '2FA_TOGGLE_FAILED'
    });
  }
};

module.exports = {
  setup2FA,
  verify2FA,
  toggle2FA,
  twoFactorAuth
};
