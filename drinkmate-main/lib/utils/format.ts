// Utility functions for formatting data

// Format currency
export const formatCurrency = (amount: number, currency: string = 'SAR'): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Format number
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ar-SA').format(num)
}

// Format date
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }).format(dateObj)
}

// Format date and time
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

// Format relative time
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  return formatDate(dateObj)
}

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format phone number
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phone
}

// Format address
export const formatAddress = (address: {
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
}): string => {
  const parts = [
    address.address1,
    address.address2,
    address.city,
    address.state,
    address.postalCode,
    address.country
  ].filter(Boolean)
  
  return parts.join(', ')
}

// Format product name for URL
export const formatSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Format percentage
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`
}

// Format rating
export const formatRating = (rating: number, maxRating: number = 5): string => {
  return `${rating.toFixed(1)}/${maxRating}`
}

// Format order status
export const formatOrderStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  }
  
  return statusMap[status] || status
}

// Format payment status
export const formatPaymentStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded'
  }
  
  return statusMap[status] || status
}

// Truncate text
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

// Capitalize first letter
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// Format initials
export const formatInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

// Format price range
export const formatPriceRange = (min: number, max: number, currency: string = 'SAR'): string => {
  if (min === max) {
    return formatCurrency(min, currency)
  }
  return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`
}

// Format discount percentage
export const formatDiscount = (originalPrice: number, salePrice: number): string => {
  const discount = Math.round((1 - salePrice / originalPrice) * 100)
  return `${discount}% OFF`
}

// Format stock status
export const formatStockStatus = (stock: number, minStock: number = 0): string => {
  if (stock <= 0) return 'Out of Stock'
  if (stock <= minStock) return `Low Stock (${stock} left)`
  return 'In Stock'
}
