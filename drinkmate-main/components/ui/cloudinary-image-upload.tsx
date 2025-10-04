"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { SafeImage } from "@/components/ui/safe-image"
import { adminAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { 
  Upload, 
  X, 
  Loader2, 
  Image as ImageIcon,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CloudinaryImageUploadProps {
  onImagesChange: (images: string[]) => void
  currentImages?: string[]
  maxImages?: number
  className?: string
  disabled?: boolean
}

interface UploadedImage {
  url: string
  publicId: string
  filename: string
}

export default function CloudinaryImageUpload({
  onImagesChange,
  currentImages = [],
  maxImages = 5,
  className,
  disabled = false
}: CloudinaryImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(() => {
    // Safely process current images, filtering out any empty/invalid URLs
    if (!currentImages || currentImages.length === 0) return [];
    
    return currentImages
      .filter(url => url && typeof url === 'string' && url.trim() !== '')
      .map(url => {
        // For debugging purposes
        console.log('Processing initial image URL:', url);
        
        return { 
          url, 
          publicId: url.includes('cloudinary.com') ? extractPublicIdFromUrl(url) : '', 
          filename: url.split('/').pop() || 'image' 
        };
      });
  });
  
  // Helper function to extract publicId from Cloudinary URL
  function extractPublicIdFromUrl(url: string): string {
    try {
      console.log('=== EXTRACTING PUBLIC ID ===')
      console.log('Input URL:', url)
      
      // Guard against invalid inputs
      if (!url || typeof url !== 'string') {
        console.log('Invalid URL input')
        return '';
      }
      
      // Check if it's a Cloudinary URL
      if (!url.includes('cloudinary.com')) {
        console.log('Not a Cloudinary URL')
        return '';
      }
      
      // For URLs with format: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image-name.jpg
      if (url.includes('/upload/')) {
        // Get everything after /upload/
        const afterUpload = url.split('/upload/')[1];
        console.log('After upload part:', afterUpload)
        
        // Handle URLs with transformations
        const parts = afterUpload.split('/');
        console.log('URL parts after upload:', parts)
        
        // Get the last part which should be the filename
        const filename = parts[parts.length - 1];
        console.log('Filename:', filename)
        
        // Remove file extension and query parameters
        const filenameWithoutExt = filename.split('.')[0].split('?')[0];
        console.log('Filename without extension:', filenameWithoutExt)
        
        // If there are path parts before the filename, include them in the publicId
        if (parts.length > 1) {
          // Filter out version numbers (v followed by digits)
          const folderPath = parts.slice(0, -1).filter(part => !part.match(/^v\d+$/)).join('/');
          console.log('Folder path (filtered):', folderPath)
          const publicId = folderPath ? `${folderPath}/${filenameWithoutExt}` : filenameWithoutExt;
          console.log('Final publicId with folder:', publicId);
          return publicId;
        } else {
          const publicId = filenameWithoutExt;
          console.log('Final publicId:', publicId);
          return publicId;
        }
      } 
      
      // For URLs with format: https://res.cloudinary.com/cloud-name/image/upload/folder/image-name.jpg
      // This is a fallback method
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      const publicId = filename.split('.')[0].split('?')[0];
      
      console.log('Extracted publicId (fallback) from URL:', publicId);
      return publicId;
    } catch (e) {
      console.warn('Error extracting publicId from Cloudinary URL:', e, 'URL:', url);
      // Return a fallback ID based on timestamp to ensure we have something
      return `unknown_${new Date().getTime()}`;
    }
  }
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Helper function to compress image
  const compressImage = (file: File, maxWidth: number = 1000, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file) // Fallback to original file
            }
          },
          file.type,
          quality
        )
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageUpload = async (files: FileList) => {
    if (disabled || isUploading) return
    
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      // Check file size (5MB limit for faster uploads)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum size is 5MB.`,
          variant: "destructive"
        })
        return false
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
          variant: "destructive"
        })
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    // Check if adding these files would exceed maxImages
    if (uploadedImages.length + validFiles.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed.`,
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    setUploadError(null)
    
    // Show initial upload toast
    toast({
      title: "Uploading images...",
      description: "Please wait while we upload your images to Cloudinary.",
      duration: 5000
    })
    
    try {
      const uploadPromises = validFiles.map(async (file) => {
        try {
          // Compress image before upload for faster transfer
          const compressedFile = await compressImage(file, 1000, 0.8)
          console.log(`Compressed ${file.name}: ${file.size} -> ${compressedFile.size} bytes`)
          
          const response = await adminAPI.uploadImage(compressedFile)
          
          if (response.success) {
            return {
              url: response.imageUrl,
              publicId: response.publicId,
              filename: response.filename
            }
          } else {
            throw new Error(response.message || 'Upload failed')
          }
        } catch (error: any) {
          console.error(`Error uploading ${file.name}:`, error)
          
          // Provide more specific error messages
          if (error.message?.includes('Server is starting up')) {
            throw new Error(`Server is starting up. Please wait a moment and try uploading ${file.name} again.`)
          } else if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
            throw new Error(`Upload timeout for ${file.name}. Please check your connection and try again.`)
          } else if (error.response?.data?.error === 'FILE_TOO_LARGE') {
            throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`)
          } else if (error.response?.data?.error === 'UPLOAD_TIMEOUT') {
            throw new Error(`Upload timeout for ${file.name}. Please try again.`)
          } else {
            throw new Error(`Failed to upload ${file.name}: ${error.message}`)
          }
        }
      })

      const newImages = await Promise.all(uploadPromises)
      
      const updatedImages = [...uploadedImages, ...newImages]
      setUploadedImages(updatedImages)
      onImagesChange(updatedImages.map(img => img.url))
      
      toast({
        title: "Upload successful",
        description: `${newImages.length} image(s) uploaded to Cloudinary successfully.`
      })
      
    } catch (error: any) {
      console.error("Error uploading images:", error)
      
      // Set error state for retry functionality
      setUploadError(error.message || "Failed to upload images")
      setRetryCount(prev => prev + 1)
      
      // Check if it's a server startup error and provide helpful guidance
      if (error.message?.includes('Server is starting up')) {
        toast({
          title: "Server is starting up",
          description: "The server is currently starting up. Please wait 30-60 seconds and try uploading again.",
          variant: "destructive",
          duration: 10000
        })
      } else {
        toast({
          title: "Upload failed",
          description: error.message || "Failed to upload images. Please try again.",
          variant: "destructive"
        })
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleRetry = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const removeImage = async (index: number) => {
    const imageToRemove = uploadedImages[index]
    
    console.log('=== IMAGE REMOVAL DEBUG ===')
    console.log('Image to remove:', imageToRemove)
    console.log('Image URL:', imageToRemove.url)
    console.log('Extracted publicId:', imageToRemove.publicId)
    console.log('PublicId type:', typeof imageToRemove.publicId)
    console.log('PublicId length:', imageToRemove.publicId?.length)
    console.log('=== END IMAGE REMOVAL DEBUG ===')
    
    // Always remove locally first
    const updatedImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(updatedImages)
    onImagesChange(updatedImages.map(img => img.url))
    
    // If we have a publicId, try to delete from Cloudinary (but don't block the UI)
    if (imageToRemove.publicId && imageToRemove.publicId !== 'unknown' && !imageToRemove.publicId.startsWith('unknown_')) {
      try {
        console.log('Attempting to delete image with publicId:', imageToRemove.publicId)
        await adminAPI.deleteImage(imageToRemove.publicId)
        console.log('Successfully deleted image from Cloudinary')
      } catch (error) {
        console.error("Failed to delete from Cloudinary:", error)
        // Don't show error to user since image is already removed locally
      }
    } else {
      console.log('No valid publicId found, skipping Cloudinary deletion')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change event triggered:', e.target.files)
    if (e.target.files && e.target.files.length > 0) {
      console.log('Files selected:', e.target.files)
      handleImageUpload(e.target.files)
    } else {
      console.log('No files selected')
    }
  }

  const openFileDialog = () => {
    console.log('openFileDialog called')
    console.log('fileInputRef.current:', fileInputRef.current)
    
    // Try using the ref first
    if (fileInputRef.current) {
      console.log('Clicking file input via ref...')
      fileInputRef.current.click()
    } else {
      // Fallback: try to find the input by ID
      console.log('Ref not available, trying to find by ID...')
      const fileInput = document.getElementById('cloudinary-file-input') as HTMLInputElement
      if (fileInput) {
        console.log('Found file input by ID, clicking...')
        fileInput.click()
      } else {
        console.error('File input not found by ref or ID')
      }
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Label>Product Images</Label>
      
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-2">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Click to upload</span> or drag and drop
          </div>
          <div className="text-xs text-muted-foreground">
            PNG, JPG, WebP, GIF up to 5MB (auto-compressed)
          </div>
          <div className="text-xs text-muted-foreground">
            {uploadedImages.length}/{maxImages} images
          </div>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => {
            console.log('Button clicked')
            openFileDialog()
          }}
          disabled={disabled || isUploading || uploadedImages.length >= maxImages}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Choose Files
            </>
          )}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled || isUploading}
          id="cloudinary-file-input"
          aria-label="Upload product images"
          title="Choose files to upload"
        />
      </div>

      {/* Image Preview Grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border relative">
                <SafeImage
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                  fallbackSrc="/images/placeholder.jpg"
                  onError={(e) => {
                    console.error(`Image failed to load: ${image.url}`, e);
                  }}
                  onLoad={() => {
                    console.log(`Image loaded successfully: ${image.url}`);
                  }}
                />
                {/* Image load status indicator */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                  {image.filename || `Image ${index + 1}`}
                </div>
              </div>
              
              {/* Remove Button */}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Uploading images to Cloudinary...</span>
        </div>
      )}

      {/* Error State with Retry */}
      {uploadError && !isUploading && (
        <div className="flex flex-col space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Upload failed</span>
          </div>
          <p className="text-sm text-red-600">{uploadError}</p>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              <Upload className="mr-2 h-4 w-4" />
              Retry Upload
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setUploadError(null)}
              className="text-red-600 hover:bg-red-100"
            >
              Dismiss
            </Button>
          </div>
          {retryCount > 0 && (
            <p className="text-xs text-red-500">
              Retry attempt: {retryCount}
            </p>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground flex items-start space-x-2">
        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <span>
          Images are automatically optimized and stored securely in the cloud. 
          You can upload up to {maxImages} images per product.
        </span>
      </div>
    </div>
  )
}
