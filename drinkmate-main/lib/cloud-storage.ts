// Backend API Integration for Image Uploads
// Uses your existing multer + Cloudinary setup

export interface UploadResult {
  success: boolean
  url?: string
  publicId?: string
  error?: string
}

// File validation constants
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_FILE_NAME_LENGTH = 255

// File validation helper
export function validateFile(file: File, type: 'image' | 'video' = 'image'): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  // Check file size
  const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    return {
      valid: false,
      error: `File size too large. Maximum size: ${maxSizeMB}MB`
    }
  }

  // Check file name length
  if (file.name.length > MAX_FILE_NAME_LENGTH) {
    return {
      valid: false,
      error: `File name too long. Maximum length: ${MAX_FILE_NAME_LENGTH} characters`
    }
  }

  // Check for dangerous file extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.php', '.asp', '.aspx', '.jsp']
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  if (dangerousExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: 'File type not allowed for security reasons'
    }
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /[<>:"|?*]/, // Invalid characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Reserved names
    /^\./, // Hidden files
    /\.(tmp|temp)$/i // Temporary files
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return {
        valid: false,
        error: 'Invalid file name'
      }
    }
  }

  return { valid: true }
}

// Sanitize file name
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special characters with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .substring(0, MAX_FILE_NAME_LENGTH) // Limit length
}

class BackendImageService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  }

  async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<UploadResult> {
    try {
      // Validate file before upload
      const validation = validateFile(file, 'image')
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Get auth token
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      if (!token) {
        return {
          success: false,
          error: 'No authentication token found'
        }
      }

      // Sanitize file name
      const sanitizedFileName = sanitizeFileName(file.name)
      const sanitizedFile = new File([file], sanitizedFileName, { type: file.type })

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('image', sanitizedFile)

      // Simulate progress updates
      if (onProgress) {
        onProgress(10) // Start
        await new Promise(resolve => setTimeout(resolve, 200))
        onProgress(50) // Middle
        await new Promise(resolve => setTimeout(resolve, 200))
        onProgress(90) // Almost done
      }

      // Upload to backend
      const response = await fetch(`${this.baseUrl}/admin/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (onProgress) {
        onProgress(100) // Complete
      }

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.message || 'Upload failed'
        }
      }

      const result = await response.json()
      console.log('Backend upload result:', result)

      return {
        success: true,
        url: result.imageUrl,
        publicId: result.publicId
      }

    } catch (error) {
      console.error('Backend upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<UploadResult> {
    try {
      // Validate file before upload
      const validation = validateFile(file, 'video')
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Get auth token
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      if (!token) {
        return {
          success: false,
          error: 'No authentication token found'
        }
      }

      // Sanitize file name
      const sanitizedFileName = sanitizeFileName(file.name)
      const sanitizedFile = new File([file], sanitizedFileName, { type: file.type })

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('video', sanitizedFile)

      // Simulate progress updates
      if (onProgress) {
        onProgress(10) // Start
        await new Promise(resolve => setTimeout(resolve, 200))
        onProgress(50) // Middle
        await new Promise(resolve => setTimeout(resolve, 200))
        onProgress(90) // Almost done
      }

      // Upload to backend
      const response = await fetch(`${this.baseUrl}/admin/upload-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (onProgress) {
        onProgress(100) // Complete
      }

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.message || 'Upload failed'
        }
      }

      const result = await response.json()
      console.log('Backend video upload result:', result)

      return {
        success: true,
        url: result.videoUrl,
        publicId: result.publicId
      }

    } catch (error) {
      console.error('Backend video upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  async deleteImage(publicId: string): Promise<UploadResult> {
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      if (!token) {
        return {
          success: false,
          error: 'No authentication token found'
        }
      }

      const response = await fetch(`${this.baseUrl}/admin/delete-image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ publicId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.message || 'Delete failed'
        }
      }

      const result = await response.json()
      return {
        success: true
      }

    } catch (error) {
      console.error('Backend delete error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      }
    }
  }
}

// Create service instance
export const backendImageService = new BackendImageService()

// Helper function to upload image with progress
export const uploadImageWithProgress = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  return await backendImageService.uploadImage(file, onProgress)
}

// Helper function to upload video with progress
export const uploadVideoWithProgress = async (
  file: File, 
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  return await backendImageService.uploadVideo(file, onProgress)
}

// Legacy compatibility (for existing code)
export const cloudStorage = {
  uploadImage: (file: File) => backendImageService.uploadImage(file),
  uploadVideo: (file: File) => backendImageService.uploadVideo(file),
  deleteImage: (publicId: string) => backendImageService.deleteImage(publicId)
}
