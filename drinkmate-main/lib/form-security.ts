// Input sanitization and validation utilities for forms
// Note: For proper XSS protection, install DOMPurify: npm install dompurify

export type SanitizeOptions = {
  allowedTags?: string[];
  allowedAttributes?: { [key: string]: string[] };
  stripIgnoreTag?: boolean;
  stripIgnoreTagBody?: boolean | string[];
  disallowedTagsMode?: 'discard' | 'escape';
};

/**
 * Basic sanitization for user input to prevent XSS attacks
 * This is a simplified version - in production, use DOMPurify
 * @param input - The user input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Basic HTML tag stripping - replace with DOMPurify in production
  const sanitized = input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#96;');
    
  return sanitized;
}

/**
 * Validates email format
 * @param email - Email to validate
 * @returns Boolean indicating if email is valid
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  
  // RFC 5322 compliant email regex
  const emailRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Object with isValid boolean and message for user feedback
 */
export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  // Check for complexity - at least one uppercase, one lowercase, one number, one special char
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return { 
      isValid: false, 
      message: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character' 
    };
  }
  
  return { isValid: true, message: 'Password is strong' };
}

/**
 * Validates phone number format
 * @param phone - Phone number to validate
 * @returns Boolean indicating if phone number is valid
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  
  // Basic international phone number format check
  // Allows for various formats including country codes
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s()\-]/g, ''));
}

/**
 * Creates a rate-limited function to prevent form spam
 * @param fn - The function to rate limit
 * @param limit - The time limit in ms (default: 2000ms)
 * @returns Rate-limited function
 */
export function createRateLimitedFunction<T extends (...args: any[]) => any>(
  fn: T, 
  limit = 2000
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastCall = 0;
  
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now();
    if (now - lastCall < limit) {
      console.warn('Rate limit exceeded');
      return undefined;
    }
    
    lastCall = now;
    return fn(...args);
  };
}
