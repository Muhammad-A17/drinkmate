// Comprehensive password policy and validation utility
const crypto = require('crypto');

// Password policy configuration
const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxConsecutiveChars: 3,
  forbiddenPasswords: [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    '1234567890', 'password1', 'qwerty123', 'dragon', 'master',
    'hello', 'login', 'princess', 'welcome123', 'solo',
    'passw0rd', 'starwars', 'freedom', 'whatever', 'trustno1'
  ],
  // Common patterns to avoid
  forbiddenPatterns: [
    /(.)\1{2,}/, // 3 or more consecutive identical characters
    /123456/, // Sequential numbers
    /abcdef/, // Sequential letters
    /qwerty/, // Keyboard patterns
    /asdfgh/, // Keyboard patterns
    /zxcvbn/  // Keyboard patterns
  ]
};

// Special characters allowed
const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * Validate password against policy
 */
function validatePassword(password) {
  const errors = [];
  const warnings = [];

  // Check length
  if (!password || password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`);
  }

  if (password && password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Password must be no more than ${PASSWORD_POLICY.maxLength} characters long`);
  }

  // Check character requirements
  if (password) {
    if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (PASSWORD_POLICY.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for forbidden passwords
    const lowerPassword = password.toLowerCase();
    if (PASSWORD_POLICY.forbiddenPasswords.includes(lowerPassword)) {
      errors.push('Password is too common and easily guessable');
    }

    // Check for forbidden patterns
    for (const pattern of PASSWORD_POLICY.forbiddenPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains easily guessable patterns');
        break;
      }
    }

    // Check for consecutive characters
    if (hasConsecutiveChars(password, PASSWORD_POLICY.maxConsecutiveChars)) {
      warnings.push(`Password contains ${PASSWORD_POLICY.maxConsecutiveChars} or more consecutive identical characters`);
    }

    // Check for common substitutions
    if (hasCommonSubstitutions(password)) {
      warnings.push('Password uses common character substitutions that are easily guessable');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    strength: calculatePasswordStrength(password)
  };
}

/**
 * Check for consecutive identical characters
 */
function hasConsecutiveChars(password, maxConsecutive) {
  if (!password) return false;
  
  let consecutiveCount = 1;
  for (let i = 1; i < password.length; i++) {
    if (password[i] === password[i - 1]) {
      consecutiveCount++;
      if (consecutiveCount >= maxConsecutive) {
        return true;
      }
    } else {
      consecutiveCount = 1;
    }
  }
  return false;
}

/**
 * Check for common character substitutions
 */
function hasCommonSubstitutions(password) {
  if (!password) return false;
  
  const commonSubstitutions = {
    'a': '@',
    'e': '3',
    'i': '1',
    'o': '0',
    's': '$',
    't': '7'
  };

  const lowerPassword = password.toLowerCase();
  for (const [original, substitute] of Object.entries(commonSubstitutions)) {
    if (lowerPassword.includes(substitute)) {
      return true;
    }
  }
  return false;
}

/**
 * Calculate password strength score (0-100)
 */
function calculatePasswordStrength(password) {
  if (!password) return 0;

  let score = 0;
  const length = password.length;

  // Length score (0-40 points)
  if (length >= 8) score += 10;
  if (length >= 12) score += 10;
  if (length >= 16) score += 10;
  if (length >= 20) score += 10;

  // Character variety score (0-30 points)
  if (/[a-z]/.test(password)) score += 5;
  if (/[A-Z]/.test(password)) score += 5;
  if (/[0-9]/.test(password)) score += 5;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 5;
  if (/[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 10;

  // Complexity score (0-20 points)
  const uniqueChars = new Set(password.toLowerCase()).size;
  if (uniqueChars >= 8) score += 10;
  if (uniqueChars >= 12) score += 10;

  // Entropy score (0-10 points)
  const entropy = calculateEntropy(password);
  if (entropy >= 3) score += 5;
  if (entropy >= 4) score += 5;

  return Math.min(score, 100);
}

/**
 * Calculate password entropy
 */
function calculateEntropy(password) {
  if (!password) return 0;

  const charSet = new Set(password);
  const charsetSize = charSet.size;
  const length = password.length;

  return Math.log2(Math.pow(charsetSize, length));
}

/**
 * Generate a secure random password
 */
function generateSecurePassword(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  // Ensure at least one character from each required category
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Check if password has been compromised (basic check)
 */
function isPasswordCompromised(password) {
  if (!password) return false;
  
  const lowerPassword = password.toLowerCase();
  return PASSWORD_POLICY.forbiddenPasswords.includes(lowerPassword);
}

/**
 * Get password strength description
 */
function getPasswordStrengthDescription(strength) {
  if (strength < 20) return { level: 'Very Weak', color: 'red' };
  if (strength < 40) return { level: 'Weak', color: 'orange' };
  if (strength < 60) return { level: 'Fair', color: 'yellow' };
  if (strength < 80) return { level: 'Good', color: 'lightgreen' };
  return { level: 'Strong', color: 'green' };
}

/**
 * Validate password confirmation
 */
function validatePasswordConfirmation(password, confirmation) {
  if (!password || !confirmation) {
    return { isValid: false, error: 'Both password and confirmation are required' };
  }
  
  if (password !== confirmation) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true };
}

module.exports = {
  PASSWORD_POLICY,
  validatePassword,
  calculatePasswordStrength,
  generateSecurePassword,
  isPasswordCompromised,
  getPasswordStrengthDescription,
  validatePasswordConfirmation,
  hasConsecutiveChars,
  hasCommonSubstitutions,
  calculateEntropy
};
