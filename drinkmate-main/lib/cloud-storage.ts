// Backend API Integration for Image Uploads
// Uses your existing multer + Cloudinary setup

export interface UploadResult {
  success: boolean
  url?: string
  publicId?: string
  error?: string
}

class BackendImageService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  }

  async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<UploadResult> {
    try {
      // Get auth token
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')
      if (!token) {
        return {
          success: false,
          error: 'No authentication token found'
        }
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('image', file)

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

// Legacy compatibility (for existing code)
export const cloudStorage = {
  uploadImage: (file: File) => backendImageService.uploadImage(file),
  deleteImage: (publicId: string) => backendImageService.deleteImage(publicId)
}
