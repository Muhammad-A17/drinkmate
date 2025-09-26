import { useState, useEffect } from 'react'
import { generateCSRFToken, validateCSRFToken } from '@/lib/api/protected-api'
import { useAuth } from '@/lib/contexts/auth-context'

export function useCSRF() {
  const { user } = useAuth()
  const [csrfToken, setCsrfToken] = useState<string>('')
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    if (user?._id) {
      const token = generateCSRFToken(user._id)
      setCsrfToken(token)
    }
  }, [user?._id])

  const validateToken = (token: string): boolean => {
    if (!user?._id) return false
    return validateCSRFToken(user._id, token)
  }

  const refreshToken = () => {
    if (user?._id) {
      const newToken = generateCSRFToken(user._id)
      setCsrfToken(newToken)
    }
  }

  return {
    csrfToken,
    validateToken,
    refreshToken,
    isValidating
  }
}
