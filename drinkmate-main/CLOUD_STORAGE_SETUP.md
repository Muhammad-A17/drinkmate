# Cloud Storage Setup Guide

## Overview
The admin panel now supports cloud storage for image uploads. Images are automatically uploaded to cloud storage instead of being stored as base64 strings.

## Supported Providers

### 1. Cloudinary (Recommended)
- **Free Tier**: 25GB storage, 25GB bandwidth/month
- **Features**: Automatic optimization, transformations, CDN
- **Setup**: 
  1. Sign up at [cloudinary.com](https://cloudinary.com)
  2. Get your Cloud Name, API Key, and API Secret
  3. Add to environment variables

### 2. AWS S3
- **Free Tier**: 5GB storage, 20,000 GET requests/month
- **Features**: Highly scalable, reliable
- **Setup**:
  1. Create AWS account and S3 bucket
  2. Create IAM user with S3 permissions
  3. Add credentials to environment variables

### 3. Local Storage (Development)
- **Use Case**: Development and testing
- **Storage**: Base64 encoding in localStorage
- **Note**: Not recommended for production

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AWS S3 Configuration (Alternative)
NEXT_PUBLIC_AWS_S3_BUCKET=your_bucket_name
NEXT_PUBLIC_AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## Configuration

The cloud storage provider is configured in `lib/cloud-storage.ts`:

```typescript
const defaultConfig: CloudStorageConfig = {
  provider: 'local', // Change to 'cloudinary' or 'aws-s3'
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  // ... other config
}
```

## Features

### Upload Process
1. **File Selection**: User selects image file
2. **Validation**: File type and size validation
3. **Upload**: File uploaded to cloud storage with progress
4. **URL Generation**: Cloud URL returned and stored
5. **Preview**: Image preview shown in admin panel

### Progress Tracking
- Real-time upload progress bar
- Upload status indicators
- Error handling and retry options

### Image Management
- **Upload**: Direct file upload to cloud
- **Preview**: Immediate preview after upload
- **Delete**: Automatic cleanup from cloud storage
- **Fallback**: URL input as backup option

## Benefits

### Performance
- **Faster Loading**: Images served from CDN
- **Optimization**: Automatic image optimization
- **Caching**: Browser and CDN caching

### Storage
- **Scalable**: Unlimited storage capacity
- **Reliable**: 99.9% uptime guarantee
- **Secure**: Encrypted storage and transfer

### Cost
- **Free Tiers**: Generous free usage limits
- **Pay-as-you-go**: Only pay for what you use
- **No Infrastructure**: No server maintenance

## Usage

### For Admins
1. Go to CO2 Cylinders admin panel
2. Click "Add New Cylinder"
3. Click "Upload to Cloud" button
4. Select image file
5. Watch upload progress
6. Image automatically appears in preview
7. Submit form to save cylinder

### For Developers
```typescript
import { cloudStorage } from '@/lib/cloud-storage'

// Upload image
const result = await cloudStorage.uploadImage(file, 'folder-name')

// Delete image
const deleteResult = await cloudStorage.deleteImage(publicId)
```

## Migration

### From Base64 to Cloud Storage
1. Set up cloud storage provider
2. Update environment variables
3. Change provider in `cloud-storage.ts`
4. Existing base64 images will continue to work
5. New uploads will use cloud storage

### Data Structure
Images are now stored as cloud URLs instead of base64:
```typescript
// Before (base64)
image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."

// After (cloud URL)
image: "https://res.cloudinary.com/demo/image/upload/v1234567890/co2-cylinders/cylinder-1.jpg"
```

## Troubleshooting

### Common Issues
1. **Upload Fails**: Check API credentials and network
2. **Slow Upload**: Check file size and internet connection
3. **Image Not Showing**: Verify URL is accessible
4. **Delete Fails**: Check permissions and public ID

### Debug Mode
Enable debug logging in browser console:
```typescript
console.log('Upload result:', result)
console.log('Delete result:', deleteResult)
```

## Security

### Best Practices
- Use environment variables for credentials
- Implement proper access controls
- Validate file types and sizes
- Use HTTPS for all transfers
- Regular security audits

### File Validation
- **Type**: Only image files allowed
- **Size**: Maximum 5MB limit
- **Format**: JPG, PNG, GIF supported
- **Content**: Basic malware scanning

## Support

For issues or questions:
1. Check browser console for errors
2. Verify environment variables
3. Test with different file types
4. Check cloud provider status
5. Review this documentation
