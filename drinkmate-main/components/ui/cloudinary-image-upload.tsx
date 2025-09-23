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
      // Guard against invalid inputs
      if (!url || typeof url !== 'string') {
        return '';
      }
      
      // Check if it's a Cloudinary URL
      if (!url.includes('cloudinary.com')) {
        return '';
      }
      
      // For URLs with format: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image-name.jpg
      if (url.includes('/upload/')) {
        // Get everything after /upload/
        const afterUpload = url.split('/upload/')[1];
        
        // Handle URLs with transformations
        const parts = afterUpload.split('/');
        
        // Get the last part which should be the filename
        const filename = parts[parts.length - 1];
        
        // Remove file extension and query parameters
        const filenameWithoutExt = filename.split('.')[0].split('?')[0];
        
        // If there are path parts before the filename, include them in the publicId
        if (parts.length > 1) {
          const folderPath = parts.slice(0, -1).join('/');
          const publicId = `${folderPath}/${filenameWithoutExt}`;
          console.log('Extracted publicId with folder from URL:', publicId);
          return publicId;
        } else {
          const publicId = filenameWithoutExt;
          console.log('Extracted publicId from URL:', publicId);
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageUpload = async (files: FileList) => {
    if (disabled || isUploading) return
    
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum size is 10MB.`,
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
    
    try {
      const uploadPromises = validFiles.map(async (file) => {
        try {
          const response = await adminAPI.uploadImage(file)
          
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
          throw new Error(`Failed to upload ${file.name}: ${error.message}`)
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
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = async (index: number) => {
    const imageToRemove = uploadedImages[index]
    
    // If we have a publicId, try to delete from Cloudinary
    if (imageToRemove.publicId) {
      try {
        await adminAPI.deleteImage(imageToRemove.publicId)
      } catch (error) {
        console.error("Failed to delete from Cloudinary:", error)
        // Continue with local removal even if Cloudinary deletion fails
      }
    }
    
    const updatedImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(updatedImages)
    onImagesChange(updatedImages.map(img => img.url))
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
            PNG, JPG, GIF up to 10MB
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
