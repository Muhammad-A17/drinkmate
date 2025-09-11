import { VALIDATION_RULES } from '@/lib/constants'

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation
export const isValidPassword = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`)
  }

  if (password.length > VALIDATION_RULES.PASSWORD_MAX_LENGTH) {
    errors.push(`Password must be no more than ${VALIDATION_RULES.PASSWORD_MAX_LENGTH} characters long`)
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Phone number validation
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Name validation
export const isValidName = (name: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (name.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    errors.push(`Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters long`)
  }

  if (name.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
    errors.push(`Name must be no more than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters long`)
  }

  if (!/^[a-zA-Z\s]+$/.test(name)) {
    errors.push('Name can only contain letters and spaces')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Message validation
export const isValidMessage = (message: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (message.length < VALIDATION_RULES.MESSAGE_MIN_LENGTH) {
    errors.push(`Message must be at least ${VALIDATION_RULES.MESSAGE_MIN_LENGTH} characters long`)
  }

  if (message.length > VALIDATION_RULES.MESSAGE_MAX_LENGTH) {
    errors.push(`Message must be no more than ${VALIDATION_RULES.MESSAGE_MAX_LENGTH} characters long`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Quantity validation
export const isValidQuantity = (quantity: number): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (quantity < VALIDATION_RULES.QUANTITY_MIN) {
    errors.push(`Quantity must be at least ${VALIDATION_RULES.QUANTITY_MIN}`)
  }

  if (quantity > VALIDATION_RULES.QUANTITY_MAX) {
    errors.push(`Quantity must be no more than ${VALIDATION_RULES.QUANTITY_MAX}`)
  }

  if (!Number.isInteger(quantity)) {
    errors.push('Quantity must be a whole number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Form validation helper
export const validateForm = (data: Record<string, any>, rules: Record<string, (value: any) => { isValid: boolean; errors: string[] }>) => {
  const errors: Record<string, string[]> = {}
  let isValid = true

  Object.keys(rules).forEach(field => {
    const value = data[field]
    const validation = rules[field](value)
    
    if (!validation.isValid) {
      errors[field] = validation.errors
      isValid = false
    }
  })

  return { isValid, errors }
}

// Common validation rules
export const validationRules = {
  email: (email: string) => ({
    isValid: isValidEmail(email),
    errors: isValidEmail(email) ? [] : ['Please enter a valid email address']
  }),
  
  password: (password: string) => isValidPassword(password),
  
  phone: (phone: string) => ({
    isValid: isValidPhone(phone),
    errors: isValidPhone(phone) ? [] : ['Please enter a valid phone number']
  }),
  
  name: (name: string) => isValidName(name),
  
  message: (message: string) => isValidMessage(message),
  
  quantity: (quantity: number) => isValidQuantity(quantity),
  
  required: (value: any) => ({
    isValid: value !== undefined && value !== null && value !== '',
    errors: value !== undefined && value !== null && value !== '' ? [] : ['This field is required']
  })
}
